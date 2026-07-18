const start = Date.parse("2012-05-14T07:30:00+07:00");
const end = Date.parse("2024-02-24T08:00:00+07:00");

function calculateTime() {
    const now = Date.now();

    return {
        now,
        elapsed: now - start,
        until: end - now
    };
}

function update() {
    const { now, elapsed, until } = calculateTime();
    const total = end - start;
    const percentage = (elapsed / total) * 100;
    const progressPercentage = Math.max(0, Math.min(100, percentage));

    const live = document.getElementById("bacca-live");
    const percentageElement = document.getElementById("percentage");
    const progressBar = document.querySelector("#progress-bar div");

    percentageElement.textContent = percentage.toFixed(8) + "%";
    progressBar.style.width = progressPercentage.toFixed(8) + "%";

    const remaining = Math.max(0, until);

    const days = Math.floor(remaining / 86_400_000);
    const hours = Math.floor(
        (remaining % 86_400_000) / 3_600_000
    );
    const minutes = Math.floor(
        (remaining % 3_600_000) / 60_000
    );
    const seconds = Math.floor(
        (remaining % 60_000) / 1_000
    );

    document.getElementById("days").textContent = days + " DAYS";
    document.getElementById("hours").textContent = hours + " HOURS";
    document.getElementById("minutes").textContent =
        minutes + " MINUTES";
    document.getElementById("seconds").textContent =
        seconds + " SECONDS";

    if (now >= end) {
        document.getElementById("days").textContent = "";
        document.getElementById("hours").textContent = "";
        document.getElementById("minutes").textContent = "";
        document.getElementById("seconds").textContent = "";

        live.style.visibility = "visible";
    }

    setTimeout(update, 10);
}

window.addEventListener("load", function () {
    update();

    document.querySelector(".countdown").style.visibility = "visible";
    document.getElementById("percentage").style.visibility = "visible";
    document.getElementById("progress-bar").style.visibility = "visible";
    document.querySelector(".footer").style.visibility = "visible";

    const audio = document.getElementById("audio");
    const musicLength = document.getElementById("music-duration");

    function updateMusicDuration() {
        if (!Number.isFinite(audio.duration)) {
            return;
        }

        const musicMinutes = Math.floor(audio.duration / 60);
        const musicSeconds = Math.floor(audio.duration % 60);

        musicLength.textContent =
            musicMinutes +
            ":" +
            String(musicSeconds).padStart(2, "0");
    }

    if (Number.isFinite(audio.duration)) {
        updateMusicDuration();
    } else {
        audio.addEventListener(
            "loadedmetadata",
            updateMusicDuration,
            { once: true }
        );
    }
});

function progress_focus() {
    const circle = document.getElementById("circle");
    const progress = document.querySelector(".progress");

    circle.style.opacity = "1";
    progress.style.backgroundColor = "#FFFFFF";
}

function progress_unfocus() {
    const circle = document.getElementById("circle");
    const progress = document.querySelector(".progress");

    circle.style.opacity = "0";
    progress.style.backgroundColor = "#FFFFFF";
}

document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById("audio");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const back = document.getElementById("backwards");
    const forward = document.getElementById("forwards");
    const progressBar = document.getElementById("music-bar");
    const progressContainer = document.getElementById("mobile-adjust");
    const circle = document.getElementById("circle");
    const musicCurrent = document.getElementById("music-time");
    const overlay = document.getElementById("overlay");

    let adjusting = false;
    let isDragging = false;

    audio.volume = 0.4;

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }

    function updateOrientationOverlay() {
        if (!overlay) {
            return;
        }

        const landscape = window.matchMedia(
            "(orientation: landscape)"
        ).matches;

        if (isMobile()) {
            overlay.style.visibility =
                landscape ? "visible" : "hidden";
        } else {
            overlay.style.visibility = "hidden";
        }
    }

    const landscapeQuery = window.matchMedia(
        "(orientation: landscape)"
    );

    landscapeQuery.addEventListener(
        "change",
        updateOrientationOverlay
    );

    updateOrientationOverlay();

    function displayCurrentTime(time) {
        const currentMinutes = Math.floor(time / 60);
        const currentSeconds = Math.floor(time % 60);

        musicCurrent.textContent =
            currentMinutes +
            ":" +
            String(currentSeconds).padStart(2, "0");
    }

    function getProgressPercent(clientX) {
        const bounds = progressContainer.getBoundingClientRect();
        const position = clientX - bounds.left;
        const percentage = (position / bounds.width) * 100;

        return Math.max(0, Math.min(100, percentage));
    }

    function previewProgress(clientX) {
        if (!Number.isFinite(audio.duration)) {
            return null;
        }

        const percentage = getProgressPercent(clientX);
        const previewTime =
            (percentage / 100) * audio.duration;

        progressBar.style.width = percentage + "%";
        circle.style.left = percentage + "%";
        displayCurrentTime(previewTime);

        return percentage;
    }

    function commitProgress(clientX) {
        const percentage = previewProgress(clientX);

        if (
            percentage !== null &&
            Number.isFinite(audio.duration)
        ) {
            audio.currentTime =
                (percentage / 100) * audio.duration;
        }
    }

    playPauseBtn.addEventListener("click", async function () {
        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                console.error("Unable to play audio:", error);
            }
        } else {
            audio.pause();
        }
    });

    audio.addEventListener("play", function () {
        playPauseBtn.textContent = "Pause";
    });

    audio.addEventListener("pause", function () {
        playPauseBtn.textContent = "Play";
    });

    audio.addEventListener("timeupdate", function () {
        if (
            adjusting ||
            !Number.isFinite(audio.duration) ||
            audio.duration <= 0
        ) {
            return;
        }

        const percentage =
            (audio.currentTime / audio.duration) * 100;

        progressBar.style.width = percentage + "%";
        circle.style.left = percentage + "%";

        displayCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", function () {
        playPauseBtn.textContent = "Play";
    });

    back.addEventListener("click", function () {
        audio.currentTime = 0;
    });

    forward.addEventListener("click", function () {
        if (Number.isFinite(audio.duration)) {
            audio.currentTime = audio.duration;
        }
    });

    progressContainer.addEventListener(
        "mousedown",
        function (event) {
            isDragging = true;
            adjusting = true;

            previewProgress(event.clientX);
        }
    );

    progressContainer.addEventListener(
        "touchstart",
        function (event) {
            const touch = event.touches[0];

            if (!touch) {
                return;
            }

            isDragging = true;
            adjusting = true;
            circle.style.opacity = "1";

            previewProgress(touch.clientX);
        },
        { passive: true }
    );

    window.addEventListener("mousemove", function (event) {
        if (!isDragging) {
            return;
        }

        adjusting = true;
        previewProgress(event.clientX);
    });

    window.addEventListener(
        "touchmove",
        function (event) {
            if (!isDragging) {
                return;
            }

            const touch = event.touches[0];

            if (!touch) {
                return;
            }

            adjusting = true;
            progressBar.style.backgroundColor = "white";
            circle.style.opacity = "1";

            previewProgress(touch.clientX);
        },
        { passive: true }
    );

    document.addEventListener("mouseup", function (event) {
        if (isDragging) {
            commitProgress(event.clientX);
        }

        isDragging = false;
        adjusting = false;
    });

    document.addEventListener("touchend", function (event) {
        if (isDragging) {
            const touch = event.changedTouches[0];

            if (touch) {
                commitProgress(touch.clientX);
            }
        }

        progressBar.style.backgroundColor = "white";
        circle.style.opacity = "0";

        isDragging = false;
        adjusting = false;
    });
});
