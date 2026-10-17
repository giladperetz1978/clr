plugins {
    id("com.android.application")
}

android {
    namespace = "com.clr.caloritrack"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.clr.caloritrack"
        minSdk = 23
        targetSdk = 35
        versionCode = 3
        versionName = "1.2"
        testInstrumentationRunner = "com.clr.caloritrack.InsetsInstrumentation"
    }
}
