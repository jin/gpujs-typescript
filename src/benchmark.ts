namespace Benchmark {

  export class Benchmark {

    isBenchmarking: boolean
    latestResults: Result
    resultHistory: Result[]
    benchmarkDuration: number
    mode: string
    framesToRender: number
    callback: () => void

    constructor() {
      this.mode = "";
      this.benchmarkDuration = 8000;
      this.resetBenchmark();
      this.resultHistory = [];
      this.framesToRender = 30;
    }

    resetBenchmark() {
      this.isBenchmarking = false;
      this.latestResults = {
        mode: this.mode,
        actualBenchmarkDuration: 0,
        totalFrameCount: 0,
        frameRenderDurations: []
      }
    }

    startBenchmark(mode: string, callback) {
      this.resetBenchmark();
      this.setMode(mode);
      this.setCallback(callback);

      this.isBenchmarking = true;
    }

    stopBenchmark() {
      this.isBenchmarking = false;
      this.latestResults.actualBenchmarkDuration =
        this.latestResults.frameRenderDurations.reduce((a, b) => a + b);

      this.computeMinMaxAvg();
      this.saveResults();
      // Provides a way to continue execution
      // after benchmarking is done.
      this.callback();
    }

    setCallback(callback) {
      this.callback = callback;
    }

    getResults() {
      return this.latestResults;
    }

    saveResults() {
      this.resultHistory.push(this.latestResults);
      localStorage.setItem(this.mode, JSON.stringify(this.latestResults));
      localStorage.setItem("history", JSON.stringify(this.resultHistory));
    }

    displaySpeedup(elem) {
      let cpuResults = JSON.parse(localStorage.getItem('cpu'));
      let gpuResults = JSON.parse(localStorage.getItem('gpu'));
      // let avgSpeedup = cpuResults.avgFrameRenderDuration / gpuResults.avgFrameRenderDuration;
      let minSpeedup = cpuResults.minFrameRenderDuration / gpuResults.minFrameRenderDuration;
      let medianSpeedup = cpuResults.medianFrameRenderDuration / gpuResults.medianFrameRenderDuration;
      elem.innerHTML = `Speedups:
      <ul>
      <li>Min frame render speedup: ${minSpeedup}</li>
      <li>Median frame render speedup: ${medianSpeedup}</li>
      </ul>`;
    }

    displayResults(elem) {
      elem.innerHTML = `
      <ul>
      <li> Mode: ${this.getResults().mode.toUpperCase()} </li>
      <li> Total frames rendered: ${this.getResults().totalFrameCount} </li>
      <li> Actual time spent (ms): ${this.getResults().actualBenchmarkDuration} </li>
      <li> Average FPS: ${this.getResults().averageFPS} </li>
      <li> Frame render time - max (ms): ${this.getResults().maxFrameRenderDuration} </li>
      <li> Frame render time - min (ms): ${this.getResults().minFrameRenderDuration} </li>
      <li> Frame render time - avg (ms): ${this.getResults().avgFrameRenderDuration} </li>
      <li> Frame render time - median (ms): ${this.getResults().medianFrameRenderDuration} </li>
      </ul>
      ${elem.innerHTML}
      `;

    }

    setMode(mode) {
      this.mode = mode;
      this.latestResults.mode = mode;
    }

    addFrameGenDuration(duration: number) {
      if (!this.isBenchmarking) { return; }
      this.latestResults.frameRenderDurations.push(duration);
    }

    incrementTotalFrameCount() {
      if (!this.isBenchmarking) { return; }
      this.latestResults.totalFrameCount += 1;
      if (this.latestResults.totalFrameCount >= this.framesToRender) {
        this.stopBenchmark();
      }
    }

    computeMinMaxAvg() {
      this.latestResults.averageFPS = this.getAverageFPS();
      this.latestResults.minFrameRenderDuration = this.getMinFrameRenderDuration();
      this.latestResults.maxFrameRenderDuration = this.getMaxFrameRenderDuration();
      this.latestResults.avgFrameRenderDuration = this.getAvgFrameRenderDuration();
      this.latestResults.medianFrameRenderDuration = this.getMedianFrameRenderDuration();
    }

    getAverageFPS() : number {
      let durationSeconds = this.getResults().actualBenchmarkDuration / 1000;
      let frameCount = this.getResults().totalFrameCount;
      return frameCount / durationSeconds;
    }

    getMinFrameRenderDuration() : number {
      return Math.min(...this.getResults().frameRenderDurations);
    }

    getMaxFrameRenderDuration() : number {
      return Math.max(...this.getResults().frameRenderDurations);
    }

    getMedianFrameRenderDuration() : number {
      let count = this.getResults().frameRenderDurations.length;
      if (count % 2 == 0) { count -= 1; }
      let median = this.getResults().frameRenderDurations.sort()[Math.floor(count / 2)];
      return median;
    }

    getAvgFrameRenderDuration() : number {
      let sum = this.getResults().frameRenderDurations.reduce((a, b) => a + b);
      let avg = sum / this.getResults().frameRenderDurations.length;
      return avg;
    }

  }

  export interface Result {
    mode: string,
    actualBenchmarkDuration: number,
    totalFrameCount: number,
    frameRenderDurations: number[],
    averageFPS?: number,
    minFrameRenderDuration?: number
    maxFrameRenderDuration?: number
    avgFrameRenderDuration?: number
    medianFrameRenderDuration?: number,
    sceneData?: any
  }

}
