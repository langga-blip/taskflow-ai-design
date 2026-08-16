package com.aistudio.taskflowai.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.google.android.gms.auth.GoogleAuthUtil
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Scope
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import org.json.JSONObject
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Hosts the full TaskFlow AI React app in a WebView.
 *
 * - Real Google account picker via native Google Sign-In (Gmail / Drive / Calendar scopes)
 * - JS bridge: AndroidBridge.signInWithGoogle() / signOutGoogle()
 * - Mic / camera permissions + multi-image file chooser
 */
class MainActivity : ComponentActivity() {

    private var webView: WebView? = null
    private var pendingPermissionRequest: PermissionRequest? = null
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private lateinit var googleSignInClient: GoogleSignInClient
    private val bgExecutor = Executors.newSingleThreadExecutor()
    private var tts: TextToSpeech? = null
    private var ttsReady = false

    // Web OAuth client ID from firebase-applet-config (used for id token).
    // Register an Android OAuth client with your debug/release SHA-1 in Google Cloud Console
    // and ensure google-services.json contains oauth_client entries.
    private val webClientId =
        "669174966035-ja824v9iirlg204vbdtv1g01774miph4.apps.googleusercontent.com"

    private val oauthScope =
        "oauth2:" +
            "https://www.googleapis.com/auth/gmail.readonly " +
            "https://www.googleapis.com/auth/gmail.send " +
            "https://www.googleapis.com/auth/drive.readonly " +
            "https://www.googleapis.com/auth/calendar.readonly " +
            "https://www.googleapis.com/auth/userinfo.email " +
            "https://www.googleapis.com/auth/userinfo.profile"

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        val granted = results.values.all { it }
        pendingPermissionRequest?.let { request ->
            if (granted) {
                request.grant(request.resources)
            } else {
                request.deny()
            }
            pendingPermissionRequest = null
        }
    }

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val callback = filePathCallback
        filePathCallback = null
        if (callback == null) return@registerForActivityResult

        if (result.resultCode != Activity.RESULT_OK || result.data == null) {
            callback.onReceiveValue(null)
            return@registerForActivityResult
        }

        val data = result.data
        val uris = mutableListOf<Uri>()

        data?.clipData?.let { clip ->
            for (i in 0 until clip.itemCount) {
                clip.getItemAt(i)?.uri?.let { uris.add(it) }
            }
        }

        if (uris.isEmpty()) {
            data?.data?.let { uris.add(it) }
        }

        callback.onReceiveValue(if (uris.isEmpty()) null else uris.toTypedArray())
    }

    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)
            if (account != null) {
                deliverGoogleAccount(account)
            } else {
                notifyJsGoogleError("No Google account returned")
            }
        } catch (e: ApiException) {
            val msg = when (e.statusCode) {
                GoogleSignInStatusCodes.SIGN_IN_CANCELLED -> "Sign-in cancelled"
                GoogleSignInStatusCodes.NETWORK_ERROR -> "Network error during Google Sign-In"
                GoogleSignInStatusCodes.DEVELOPER_ERROR ->
                    "Google Sign-In misconfigured (SHA-1 / OAuth client). Add your app SHA-1 in Google Cloud Console."
                else -> "Google Sign-In failed (${e.statusCode}): ${e.message}"
            }
            Log.w(TAG, msg, e)
            notifyJsGoogleError(msg)
        } catch (e: Exception) {
            Log.w(TAG, "Google Sign-In error", e)
            notifyJsGoogleError(e.message ?: "Google Sign-In failed")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .requestIdToken(webClientId)
            .requestScopes(
                Scope("https://www.googleapis.com/auth/gmail.readonly"),
                Scope("https://www.googleapis.com/auth/gmail.send"),
                Scope("https://www.googleapis.com/auth/drive.readonly"),
                Scope("https://www.googleapis.com/auth/calendar.readonly")
            )
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)

        tts = TextToSpeech(this) { status ->
            ttsReady = status == TextToSpeech.SUCCESS
            if (ttsReady) {
                tts?.language = Locale.US
                tts?.setSpeechRate(1.02f)
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        runOnUiThread {
                            webView?.evaluateJavascript(
                                "window.onNativeTtsStart && window.onNativeTtsStart();",
                                null
                            )
                        }
                    }

                    override fun onDone(utteranceId: String?) {
                        runOnUiThread {
                            webView?.evaluateJavascript(
                                "window.onNativeTtsEnd && window.onNativeTtsEnd();",
                                null
                            )
                        }
                    }

                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) {
                        runOnUiThread {
                            webView?.evaluateJavascript(
                                "window.onNativeTtsEnd && window.onNativeTtsEnd();",
                                null
                            )
                        }
                    }
                })
            } else {
                Log.w(TAG, "TextToSpeech init failed: $status")
            }
        }

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                cacheMode = WebSettings.LOAD_DEFAULT
                @Suppress("DEPRECATION")
                allowFileAccessFromFileURLs = true
                @Suppress("DEPRECATION")
                allowUniversalAccessFromFileURLs = true
            }

            addJavascriptInterface(AndroidBridge(), "AndroidBridge")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    return false
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    if (request == null) return
                    val needsAudio = request.resources.any {
                        it == PermissionRequest.RESOURCE_AUDIO_CAPTURE
                    }
                    val needsVideo = request.resources.any {
                        it == PermissionRequest.RESOURCE_VIDEO_CAPTURE
                    }

                    val missing = mutableListOf<String>()
                    if (needsAudio &&
                        ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.RECORD_AUDIO
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        missing.add(Manifest.permission.RECORD_AUDIO)
                    }
                    if (needsVideo &&
                        ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.CAMERA
                        ) != PackageManager.PERMISSION_GRANTED
                    ) {
                        missing.add(Manifest.permission.CAMERA)
                    }

                    if (missing.isEmpty()) {
                        request.grant(request.resources)
                    } else {
                        pendingPermissionRequest = request
                        permissionLauncher.launch(missing.toTypedArray())
                    }
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = filePathCallback

                    val intent = try {
                        fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                            addCategory(Intent.CATEGORY_OPENABLE)
                            type = "image/*"
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        }
                    } catch (e: Exception) {
                        Intent(Intent.ACTION_GET_CONTENT).apply {
                            addCategory(Intent.CATEGORY_OPENABLE)
                            type = "image/*"
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        }
                    }

                    val acceptTypes = fileChooserParams?.acceptTypes
                    if (acceptTypes != null && acceptTypes.isNotEmpty() && acceptTypes[0].isNotBlank()) {
                        if (acceptTypes.size == 1) {
                            intent.type = acceptTypes[0]
                        } else {
                            intent.type = "*/*"
                            intent.putExtra(Intent.EXTRA_MIME_TYPES, acceptTypes)
                        }
                    } else {
                        intent.type = "image/*"
                    }

                    intent.putExtra(
                        Intent.EXTRA_ALLOW_MULTIPLE,
                        fileChooserParams?.mode == FileChooserParams.MODE_OPEN_MULTIPLE
                    )

                    return try {
                        fileChooserLauncher.launch(Intent.createChooser(intent, "Select image(s)"))
                        true
                    } catch (e: Exception) {
                        this@MainActivity.filePathCallback = null
                        filePathCallback?.onReceiveValue(null)
                        false
                    }
                }
            }

            loadUrl("file:///android_asset/www/index.html")
        }

        setContentView(webView)
    }

    private fun deliverGoogleAccount(account: GoogleSignInAccount) {
        bgExecutor.execute {
            var accessToken = ""
            try {
                accessToken = GoogleAuthUtil.getToken(this, account.account!!, oauthScope)
            } catch (e: Exception) {
                Log.w(TAG, "GoogleAuthUtil.getToken failed", e)
            }

            val payload = JSONObject().apply {
                put("success", true)
                put("email", account.email ?: "")
                put("displayName", account.displayName ?: "")
                put("photoUrl", account.photoUrl?.toString() ?: "")
                put("id", account.id ?: "")
                put("idToken", account.idToken ?: "")
                put("accessToken", accessToken)
                put("serverAuthCode", account.serverAuthCode ?: "")
            }

            runOnUiThread {
                val js =
                    "window.onNativeGoogleSignIn && window.onNativeGoogleSignIn($payload);"
                webView?.evaluateJavascript(js, null)
            }
        }
    }

    private fun notifyJsGoogleError(message: String) {
        val safe = JSONObject.quote(message)
        val js =
            "window.onNativeGoogleSignIn && window.onNativeGoogleSignIn({success:false,error:$safe});"
        webView?.evaluateJavascript(js, null)
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun signInWithGoogle() {
            runOnUiThread {
                googleSignInClient.signOut().addOnCompleteListener {
                    googleSignInLauncher.launch(googleSignInClient.signInIntent)
                }
            }
        }

        @JavascriptInterface
        fun signOutGoogle() {
            runOnUiThread {
                googleSignInClient.signOut()
            }
        }

        @JavascriptInterface
        fun isNativeGoogleAvailable(): Boolean = true

        /** Native Android TTS — WebView speechSynthesis is often silent */
        @JavascriptInterface
        fun speak(text: String) {
            runOnUiThread {
                val clean = text.trim()
                if (clean.isEmpty()) {
                    webView?.evaluateJavascript(
                        "window.onNativeTtsEnd && window.onNativeTtsEnd();",
                        null
                    )
                    return@runOnUiThread
                }
                if (!ttsReady || tts == null) {
                    Log.w(TAG, "TTS not ready")
                    webView?.evaluateJavascript(
                        "window.onNativeTtsEnd && window.onNativeTtsEnd();",
                        null
                    )
                    return@runOnUiThread
                }
                val params = Bundle()
                tts?.speak(clean, TextToSpeech.QUEUE_FLUSH, params, "taskflow_tts")
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            runOnUiThread {
                try {
                    tts?.stop()
                } catch (_: Exception) {
                }
            }
        }

        @JavascriptInterface
        fun isTtsAvailable(): Boolean = ttsReady

        /** Persist small values (e.g. Gemini API key) so they survive WebView reloads */
        @JavascriptInterface
        fun setPref(key: String, value: String) {
            getSharedPreferences("taskflow_prefs", MODE_PRIVATE)
                .edit()
                .putString(key, value)
                .apply()
        }

        @JavascriptInterface
        fun getPref(key: String): String {
            return getSharedPreferences("taskflow_prefs", MODE_PRIVATE)
                .getString(key, "") ?: ""
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        val wv = webView
        if (wv != null && wv.canGoBack()) {
            wv.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (_: Exception) {
        }
        tts = null
        webView?.destroy()
        webView = null
        bgExecutor.shutdownNow()
        super.onDestroy()
    }

    companion object {
        private const val TAG = "TaskFlowMain"
    }
}
