package com.example.data

import com.example.model.MediaItemData

object SampleMediaLibrary {
    val sampleTracks: List<MediaItemData> = listOf(
        // Audio Tracks
        MediaItemData(
            id = "audio_1",
            title = "Acoustic Breeze",
            artist = "Benjamin Tissot",
            mediaUri = "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
            artworkUri = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80",
            durationMs = 157000L,
            isVideo = false,
            genre = "أكوستيك / هادئ"
        ),
        MediaItemData(
            id = "audio_2",
            title = "Sunny Summer Beat",
            artist = "Bensound Royalty Free",
            mediaUri = "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
            artworkUri = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80",
            durationMs = 140000L,
            isVideo = false,
            genre = "بوب إيقاعي"
        ),
        MediaItemData(
            id = "audio_3",
            title = "Energy Pulse Dance",
            artist = "ElectroWave Sound",
            mediaUri = "https://www.bensound.com/bensound-music/bensound-energy.mp3",
            artworkUri = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
            durationMs = 179000L,
            isVideo = false,
            genre = "إلكتروني / حماسي"
        ),
        MediaItemData(
            id = "audio_4",
            title = "Creative Minds",
            artist = "Acoustic Harmony",
            mediaUri = "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
            artworkUri = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80",
            durationMs = 147000L,
            isVideo = false,
            genre = "إلهام وتأمل"
        ),
        MediaItemData(
            id = "audio_5",
            title = "Memories Piano Solo",
            artist = "Classical Horizons",
            mediaUri = "https://www.bensound.com/bensound-music/bensound-memories.mp3",
            artworkUri = "https://images.unsplash.com/photo-1520523839898-50712825e617?w=600&q=80",
            durationMs = 230000L,
            isVideo = false,
            genre = "بيانو كلاسيكي"
        ),
        MediaItemData(
            id = "audio_6",
            title = "Slow Motion Lounge",
            artist = "Chillout Collective",
            mediaUri = "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
            artworkUri = "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80",
            durationMs = 206000L,
            isVideo = false,
            genre = "لو فاي واسترخاء"
        ),
        // Video Tracks
        MediaItemData(
            id = "video_1",
            title = "Big Buck Bunny (HD Animation)",
            artist = "Blender Open Project",
            mediaUri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            artworkUri = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80",
            durationMs = 596000L,
            isVideo = true,
            genre = "أنيميشن سينمائي"
        ),
        MediaItemData(
            id = "video_2",
            title = "Elephants Dream (Sci-Fi Fantasy)",
            artist = "Orange Open Movie",
            mediaUri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            artworkUri = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80",
            durationMs = 653000L,
            isVideo = true,
            genre = "خيال علمي"
        ),
        MediaItemData(
            id = "video_3",
            title = "For Bigger Blazes (Nature & Fire)",
            artist = "Google Media Samples",
            mediaUri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            artworkUri = "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80",
            durationMs = 15000L,
            isVideo = true,
            genre = "طبيعة سينمائية"
        ),
        MediaItemData(
            id = "video_4",
            title = "For Bigger Escape (Action Scene)",
            artist = "Chromecast HD Showcase",
            mediaUri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            artworkUri = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80",
            durationMs = 15000L,
            isVideo = true,
            genre = "أكشن ومغامرات"
        ),
        MediaItemData(
            id = "video_5",
            title = "Tears of Steel (VFX Sci-Fi)",
            artist = "Mango Open Movie Studio",
            mediaUri = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
            artworkUri = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
            durationMs = 734000L,
            isVideo = true,
            genre = "مؤثرات بصرية"
        )
    )
}
