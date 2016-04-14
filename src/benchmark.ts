namespace Benchmark {

  export class Benchmark {

    isBenchmarking: boolean
    latestResults: Result 
    benchmarkDuration: number 
    mode: string

    constructor() {
      this.mode = "";
      this.isBenchmarking = false;
      this.benchmarkDuration = 3000;
      this.latestResults = {
        mode: this.mode,
        actualBenchmarkDuration: 0,
        totalFrameCount: 0,
        frameRenderDurations: []
      }
    }

    startBenchmark(mode: string, callback) {
      if (mode !== undefined) {
        this.mode = mode;
      }

      this.resetBenchmark();
      this.isBenchmarking = true;

      setTimeout(() => {
        this.stopBenchmark();
        callback();
      }, this.benchmarkDuration);
    }

    stopBenchmark() {
      console.log(this.latestResults);
      this.isBenchmarking = false;
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

    addFrameGenDuration(duration: number) {
      if (!this.isBenchmarking) { return; }
      this.latestResults.frameRenderDurations.push(duration);
    }

    incrementTotalFrameCount() {
      if (!this.isBenchmarking) { return; }
      this.latestResults.totalFrameCount += 1;
    }

  }

  export interface Result {
    mode: string,
    actualBenchmarkDuration: number,
    totalFrameCount: number,
    frameRenderDurations: number[]
  }

}
