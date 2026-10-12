package com.example.model

enum class MediaType {
    AUDIO,
    VIDEO
}

enum class RepeatMode {
    OFF,
    ALL,
    ONE
}

enum class AudioPreset(val displayName: String) {
    FLAT("عادي (Flat)"),
    BASS_BOOST("تعزيز البيس (Bass Boost)"),
    VOCAL("إبراز الصوت (Vocal)"),
    ROCK("روك (Rock)"),
    ELECTRONIC("إلكتروني (EDM)"),
    ACOUSTIC("صوت نقي (Acoustic)")
}

data class MediaItemData(
    val id: String,
    val title: String,
    val artist: String,
    val mediaUri: String,
    val artworkUri: String = "",
    val durationMs: Long = 0L,
    val isVideo: Boolean = false,
    val genre: String = "عام",
    val isLocal: Boolean = false
)
