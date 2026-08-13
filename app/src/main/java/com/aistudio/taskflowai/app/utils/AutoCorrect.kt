package com.aistudio.taskflowai.app.utils

object AutoCorrect {
    private val dictionary = mapOf(
        "im" to "I'm",
        "cant" to "can't",
        "dont" to "don't",
        "isnt" to "isn't",
        "wont" to "won't",
        "didnt" to "didn't",
        "couldnt" to "couldn't",
        "wouldnt" to "wouldn't",
        "pls" to "please",
        "plz" to "please",
        "ur" to "your",
        "r" to "are",
        "u" to "you",
        "thx" to "thanks",
        "teh" to "the",
        "taht" to "that",
        "thier" to "their",
        "recieve" to "receive",
        "seperate" to "separate",
        "recomend" to "recommend",
        "sucess" to "success",
        "bussiness" to "business",
        "tomorow" to "tomorrow",
        "tommorrow" to "tomorrow",
        "helpp" to "help",
        "shoud" to "should",
        "feauture" to "feature",
        "optmize" to "optimize",
        "workfow" to "workflow",
        "taks" to "tasks",
        "asistant" to "assistant"
    )

    fun correct(text: String): String {
        if (text.isBlank()) return text
        var corrected = text
        for ((bad, good) in dictionary) {
            val regex = Regex("\\b$bad\\b", RegexOption.IGNORE_CASE)
            corrected = regex.replace(corrected) { match ->
                val str = match.value
                if (str.first().isUpperCase()) good.replaceFirstChar { it.uppercase() } else good
            }
        }
        return corrected.trim().replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
}
