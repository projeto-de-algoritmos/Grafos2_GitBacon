import { Candidate } from "./candidate";

export class MinHeap {
  private heap: Candidate[];

  constructor() {
    this.heap = [];
  }

  public getMin(): Candidate | null {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }
  public pop(): Candidate {
    this.swap(0, this.heap.length - 1);
    const v = this.heap.pop()!;
    this.bubbleDown(0);
    return v;
  }

  private bubbleDown(index: number): void {
    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;
    let smallestIndex = index;

    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex].distance < this.heap[smallestIndex].distance
    ) {
      smallestIndex = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex].distance < this.heap[smallestIndex].distance
    ) {
      smallestIndex = rightChildIndex;
    }

    if (smallestIndex !== index) {
      this.swap(index, smallestIndex);
      this.bubbleDown(smallestIndex);
    }
  }

  public insert(value: Candidate): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(index: number): void {
    const parentIndex = Math.floor((index - 1) / 2);
    if (
      parentIndex >= 0 &&
      this.heap[parentIndex].distance > this.heap[index].distance
    ) {
      this.swap(parentIndex, index);
      this.bubbleUp(parentIndex);
    }
  }

  private swap(index1: number, index2: number): void {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }
}
