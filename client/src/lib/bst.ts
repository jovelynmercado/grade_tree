import type { BSTNode, BSTOperation } from "@shared/schema";

export class BST {
  root: BSTNode | null = null;
  operations: BSTOperation[] = [];

  insert(value: number, label: string, data: any): BSTOperation {
    const steps: string[] = [];
    let comparisons = 0;

    const newNode: BSTNode = { value, label, data, left: null, right: null };

    if (!this.root) {
      this.root = newNode;
      steps.push(`Tree is empty. Inserting ${value} as root.`);
    } else {
      let current = this.root;
      let parent: BSTNode | null = null;

      while (current) {
        comparisons++;
        parent = current;
        
        if (value < current.value) {
          steps.push(`${value} < ${current.value}, go left`);
          if (!current.left) {
            current.left = newNode;
            steps.push(`Inserted ${value} as left child of ${current.value}`);
            break;
          }
          current = current.left;
        } else {
          steps.push(`${value} >= ${current.value}, go right`);
          if (!current.right) {
            current.right = newNode;
            steps.push(`Inserted ${value} as right child of ${current.value}`);
            break;
          }
          current = current.right;
        }
      }
    }

    const operation: BSTOperation = {
      type: "insert",
      value,
      steps,
      comparisons,
    };

    this.operations.push(operation);
    return operation;
  }

  search(value: number): BSTOperation {
    const steps: string[] = [];
    let comparisons = 0;
    let found = false;

    let current = this.root;

    if (!current) {
      steps.push("Tree is empty. Value not found.");
    } else {
      while (current) {
        comparisons++;
        
        if (value === current.value) {
          steps.push(`Found ${value}!`);
          found = true;
          break;
        } else if (value < current.value) {
          steps.push(`${value} < ${current.value}, go left`);
          current = current.left;
        } else {
          steps.push(`${value} > ${current.value}, go right`);
          current = current.right;
        }
      }

      if (!found && !current) {
        steps.push(`Value ${value} not found in tree.`);
      }
    }

    const operation: BSTOperation = {
      type: "search",
      value,
      steps,
      comparisons,
      found,
    };

    this.operations.push(operation);
    return operation;
  }

  inOrderTraversal(node: BSTNode | null = this.root, result: BSTNode[] = []): BSTNode[] {
    if (node) {
      this.inOrderTraversal(node.left, result);
      result.push(node);
      this.inOrderTraversal(node.right, result);
    }
    return result;
  }

  preOrderTraversal(node: BSTNode | null = this.root, result: BSTNode[] = []): BSTNode[] {
    if (node) {
      result.push(node);
      this.preOrderTraversal(node.left, result);
      this.preOrderTraversal(node.right, result);
    }
    return result;
  }

  postOrderTraversal(node: BSTNode | null = this.root, result: BSTNode[] = []): BSTNode[] {
    if (node) {
      this.postOrderTraversal(node.left, result);
      this.postOrderTraversal(node.right, result);
      result.push(node);
    }
    return result;
  }

  getTreeData(): BSTNode | null {
    return this.root;
  }

  getOperations(): BSTOperation[] {
    return this.operations;
  }

  clear(): void {
    this.root = null;
    this.operations = [];
  }

  calculatePositions(node: BSTNode | null = this.root, level: number = 0, position: number = 0, positions: Map<BSTNode, { x: number; y: number }> = new Map()): Map<BSTNode, { x: number; y: number }> {
    if (!node) return positions;

    const levelHeight = 80;
    const levelWidth = Math.pow(2, this.getMaxDepth() - level) * 40;

    node.x = position;
    node.y = level * levelHeight + 50;
    node.level = level;

    positions.set(node, { x: node.x, y: node.y });

    if (node.left) {
      this.calculatePositions(node.left, level + 1, position - levelWidth / 2, positions);
    }
    if (node.right) {
      this.calculatePositions(node.right, level + 1, position + levelWidth / 2, positions);
    }

    return positions;
  }

  getMaxDepth(node: BSTNode | null = this.root): number {
    if (!node) return 0;
    return 1 + Math.max(this.getMaxDepth(node.left), this.getMaxDepth(node.right));
  }

  getNodeCount(node: BSTNode | null = this.root): number {
    if (!node) return 0;
    return 1 + this.getNodeCount(node.left) + this.getNodeCount(node.right);
  }
}

export function buildBSTFromData(data: { value: number; label: string; data: any }[]): BST {
  const bst = new BST();
  data.forEach(item => {
    bst.insert(item.value, item.label, item.data);
  });
  return bst;
}
