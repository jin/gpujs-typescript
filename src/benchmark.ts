namespace Benchmark {

  export class Benchmark {

    isBenchmarking: boolean
    latestResults: Result 
    benchmarkDuration: number 
    mode: string

    constructor() {
      this.mode = "";
      this.benchmarkDuration = 3000;
      this.resetBenchmark();
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

      this.isBenchmarking = true;
      let startTime = performance.now(), endTime;
      setTimeout(() => {
        this.stopBenchmark();

        let timeTaken = performance.now() - startTime;
        this.latestResults.actualBenchmarkDuration = timeTaken;

        this.computeMinMaxAvg();
        // Provides a way to continue execution
        // after benchmarking is done.
        this.saveResults();
        callback();
      }, this.benchmarkDuration);
    }

    stopBenchmark() {
      this.isBenchmarking = false;
    }

    getResults() {
      return this.latestResults;
    }

    saveResults() {
      localStorage.setItem(this.mode, JSON.stringify(this.latestResults));
    }

    displayResults(elem) {
      elem.innerHTML = `
      <ul>
        <li> Time elapsed (ms): ${this.getResults().actualBenchmarkDuration} </li>
        <li> Total frames rendered: ${this.getResults().totalFrameCount} </li>
        <li> Average FPS: ${this.getResults().averageFPS} </li>
        <li> Frame render time (max): ${this.getResults().maxFrameRenderDuration} </li>
        <li> Frame render time (min): ${this.getResults().minFrameRenderDuration} </li>
        <li> Frame render time (avg): ${this.getResults().avgFrameRenderDuration} </li>
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
    }

    computeMinMaxAvg() {
      this.latestResults.averageFPS = this.getAverageFPS();
      this.latestResults.minFrameRenderDuration = this.getMinFrameRenderDuration();
      this.latestResults.maxFrameRenderDuration = this.getMaxFrameRenderDuration();
      this.latestResults.avgFrameRenderDuration = this.getAvgFrameRenderDuration();
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
  }

}
