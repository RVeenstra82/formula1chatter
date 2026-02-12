package com.f1chatter.backend.util

import java.time.LocalDate

object F1SeasonUtils {
    /**
     * Determines the current F1 season based on the current date.
     * Always returns the current calendar year. Even though the F1 season
     * typically starts in March, the upcoming season calendar is published
     * well before that, and users need to see those races in Jan/Feb.
     */
    fun getCurrentSeason(): Int {
        return LocalDate.now().year
    }
}
