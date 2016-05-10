var Benchmark;
(function (Benchmark_1) {
    var Benchmark = (function () {
        function Benchmark() {
            this.mode = "";
            this.benchmarkDuration = 8000;
            this.resetBenchmark();
            this.resultHistory = [];
            this.framesToRender = 60;
        }
        Benchmark.prototype.resetBenchmark = function () {
            this.isBenchmarking = false;
            this.latestResults = {
                mode: this.mode,
                actualBenchmarkDuration: 0,
                totalFrameCount: 0,
                frameRenderDurations: []
            };
            this.startTime = null;
        };
        Benchmark.prototype.startBenchmark = function (mode, callback) {
            this.resetBenchmark();
            this.setMode(mode);
            this.setCallback(callback);
            this.startTime = performance.now();
            this.isBenchmarking = true;
        };
        Benchmark.prototype.stopBenchmark = function () {
            this.isBenchmarking = false;
            this.latestResults.actualBenchmarkDuration = performance.now() - this.startTime;
            this.computeMinMaxAvg();
            this.saveResults();
            this.callback();
        };
        Benchmark.prototype.setCallback = function (callback) {
            this.callback = callback;
        };
        Benchmark.prototype.getResults = function () {
            return this.latestResults;
        };
        Benchmark.prototype.saveResults = function () {
            this.resultHistory.push(this.latestResults);
            localStorage.setItem(this.mode, JSON.stringify(this.latestResults));
            localStorage.setItem("history", JSON.stringify(this.resultHistory));
        };
        Benchmark.prototype.displaySpeedup = function (elem) {
            var cpuResults = JSON.parse(localStorage.getItem('cpu'));
            var gpuResults = JSON.parse(localStorage.getItem('gpu'));
            var minSpeedup = cpuResults.minFrameRenderDuration / gpuResults.minFrameRenderDuration;
            var medianSpeedup = cpuResults.medianFrameRenderDuration / gpuResults.medianFrameRenderDuration;
            var fpsSpeedup = gpuResults.averageFPS / cpuResults.averageFPS;
            elem.innerHTML = "Speedups:\n      <ul>\n        <li>FPS speedup: " + fpsSpeedup + "</li>\n        <li>Min frame render speedup: " + minSpeedup + "</li>\n        <li>Median frame render speedup: " + medianSpeedup + "</li>\n      </ul>";
        };
        Benchmark.prototype.displayResults = function (elem) {
            var dimElem = document.getElementById('grid-dimension');
            var sphereElem = document.getElementById('sphere-count');
            elem.innerHTML = "\n      <ul>\n        <li> Mode: " + this.getResults().mode.toUpperCase() + " </li>\n        <li> Dimension: " + dimElem.innerHTML + " </li>\n        <li> Sphere count: " + sphereElem.innerHTML + " </li>\n        <li> Total frames rendered: " + this.getResults().totalFrameCount + " </li>\n        <li> Actual time spent (ms): " + this.getResults().actualBenchmarkDuration + " </li>\n        <li> Average FPS: " + this.getResults().averageFPS + " </li>\n        <li> Frame render time - min (ms): " + this.getResults().minFrameRenderDuration + " </li>\n        <li> Frame render time - median (ms): " + this.getResults().medianFrameRenderDuration + " </li>\n      </ul>\n      " + elem.innerHTML + "\n      ";
        };
        Benchmark.prototype.setMode = function (mode) {
            this.mode = mode;
            this.latestResults.mode = mode;
        };
        Benchmark.prototype.addFrameGenDuration = function (duration) {
            if (!this.isBenchmarking) {
                return;
            }
            this.latestResults.frameRenderDurations.push(duration);
        };
        Benchmark.prototype.incrementTotalFrameCount = function () {
            if (!this.isBenchmarking) {
                return;
            }
            this.latestResults.totalFrameCount += 1;
            if (this.latestResults.totalFrameCount >= this.framesToRender) {
                this.stopBenchmark();
            }
        };
        Benchmark.prototype.computeMinMaxAvg = function () {
            this.latestResults.averageFPS = this.getAverageFPS();
            this.latestResults.minFrameRenderDuration = this.getMinFrameRenderDuration();
            this.latestResults.maxFrameRenderDuration = this.getMaxFrameRenderDuration();
            this.latestResults.avgFrameRenderDuration = this.getAvgFrameRenderDuration();
            this.latestResults.medianFrameRenderDuration = this.getMedianFrameRenderDuration();
        };
        Benchmark.prototype.getAverageFPS = function () {
            var durationSeconds = this.getResults().actualBenchmarkDuration / 1000;
            var frameCount = this.getResults().totalFrameCount;
            return frameCount / durationSeconds;
        };
        Benchmark.prototype.getMinFrameRenderDuration = function () {
            return Math.min.apply(Math, this.getResults().frameRenderDurations);
        };
        Benchmark.prototype.getMaxFrameRenderDuration = function () {
            return Math.max.apply(Math, this.getResults().frameRenderDurations);
        };
        Benchmark.prototype.getMedianFrameRenderDuration = function () {
            var count = this.getResults().frameRenderDurations.length;
            if (count % 2 == 0) {
                count -= 1;
            }
            var median = this.getResults().frameRenderDurations.sort()[Math.floor(count / 2)];
            return median;
        };
        Benchmark.prototype.getAvgFrameRenderDuration = function () {
            var sum = this.getResults().frameRenderDurations.reduce(function (a, b) { return a + b; });
            var avg = sum / this.getResults().frameRenderDurations.length;
            return avg;
        };
        return Benchmark;
    }());
    Benchmark_1.Benchmark = Benchmark;
})(Benchmark || (Benchmark = {}));
//# sourceMappingURL=benchmark.js.map