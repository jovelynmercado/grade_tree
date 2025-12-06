import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BST, buildBSTFromData } from "@/lib/bst";
import type { Student, Grade } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Binary, Play, Search, RotateCcw, ArrowRight, ChevronRight } from "lucide-react";
import type { BSTNode, BSTOperation } from "@shared/schema";

type KeyType = "studentId" | "grade";

export default function BSTPage() {
  const [keyType, setKeyType] = useState<KeyType>("studentId");
  const [bst, setBst] = useState<BST | null>(null);
  const [operations, setOperations] = useState<BSTOperation[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [lastSearchResult, setLastSearchResult] = useState<BSTOperation | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: grades, isLoading: loadingGrades } = useQuery<Grade[]>({
    queryKey: ["/api/grades"],
  });

  const isLoading = loadingStudents || loadingGrades;

  const buildTree = () => {
    if (!students || students.length === 0) return;

    let data: { value: number; label: string; data: any }[] = [];

    if (keyType === "studentId") {
      data = students.map((student) => ({
        value: parseInt(student.studentId.replace(/\D/g, "")) || Math.random() * 1000,
        label: student.studentId,
        data: student,
      }));
    } else if (keyType === "grade" && grades) {
      const studentGradeMap = new Map<string, number>();
      students.forEach((student) => {
        const studentGrades = grades.filter((g) => g.studentId === student.id);
        if (studentGrades.length > 0) {
          const avgGrade = studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length;
          studentGradeMap.set(student.id, Math.round(avgGrade));
        }
      });

      data = students
        .filter((student) => studentGradeMap.has(student.id))
        .map((student) => ({
          value: studentGradeMap.get(student.id)!,
          label: `${student.name}: ${studentGradeMap.get(student.id)}`,
          data: student,
        }));
    }

    if (data.length === 0) {
      data = students.slice(0, 10).map((student, i) => ({
        value: (i + 1) * 10,
        label: student.studentId,
        data: student,
      }));
    }

    const newBst = buildBSTFromData(data);
    setBst(newBst);
    setOperations(newBst.getOperations());
    setLastSearchResult(null);
    setHighlightedNode(null);
  };

  const handleSearch = () => {
    if (!bst || !searchValue) return;

    const value = parseInt(searchValue);
    if (isNaN(value)) return;

    const result = bst.search(value);
    setLastSearchResult(result);
    setOperations([...bst.getOperations()]);
    if (result.found) {
      setHighlightedNode(value);
      setTimeout(() => setHighlightedNode(null), 2000);
    }
  };

  const handleReset = () => {
    setBst(null);
    setOperations([]);
    setLastSearchResult(null);
    setSearchValue("");
    setHighlightedNode(null);
  };

  const renderTree = () => {
    if (!bst || !bst.root) return null;

    const nodes: JSX.Element[] = [];
    const lines: JSX.Element[] = [];
    const canvasWidth = 800;
    const canvasHeight = 400;

    const renderNode = (
      node: BSTNode,
      x: number,
      y: number,
      level: number,
      parentX?: number,
      parentY?: number
    ) => {
      const nodeRadius = 28;
      const levelHeight = 70;
      const spreadFactor = Math.pow(0.5, level) * (canvasWidth / 3);

      if (parentX !== undefined && parentY !== undefined) {
        lines.push(
          <line
            key={`line-${node.value}-${level}`}
            x1={parentX}
            y1={parentY + nodeRadius}
            x2={x}
            y2={y - nodeRadius}
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
        );
      }

      const isHighlighted = highlightedNode === node.value;

      nodes.push(
        <g key={`node-${node.value}-${level}`} transform={`translate(${x}, ${y})`}>
          <circle
            r={nodeRadius}
            fill={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--card))"}
            stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"}
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={`text-sm font-mono font-medium ${isHighlighted ? "fill-primary-foreground" : "fill-foreground"}`}
          >
            {node.value}
          </text>
          <text
            y={nodeRadius + 14}
            textAnchor="middle"
            className="text-xs fill-muted-foreground"
          >
            {node.label.length > 10 ? node.label.slice(0, 10) + "..." : node.label}
          </text>
        </g>
      );

      if (node.left) {
        renderNode(node.left, x - spreadFactor, y + levelHeight, level + 1, x, y);
      }
      if (node.right) {
        renderNode(node.right, x + spreadFactor, y + levelHeight, level + 1, x, y);
      }
    };

    renderNode(bst.root, canvasWidth / 2, 50, 0);

    return (
      <>
        {lines}
        {nodes}
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-bst-title">
          BST Visualizer
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore Binary Search Tree operations with student data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Binary className="w-5 h-5" />
                Controls
              </CardTitle>
              <CardDescription>Configure and build the BST</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Build BST by</label>
                <Select value={keyType} onValueChange={(v) => setKeyType(v as KeyType)}>
                  <SelectTrigger data-testid="select-key-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studentId">Student ID</SelectItem>
                    <SelectItem value="grade">Average Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={buildTree}
                disabled={isLoading || !students?.length}
                data-testid="button-build-tree"
              >
                <Play className="w-4 h-4 mr-2" />
                Build Tree
              </Button>

              <div className="pt-4 border-t space-y-2">
                <label className="text-sm font-medium">Search Value</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Enter value..."
                    disabled={!bst}
                    data-testid="input-search-value"
                  />
                  <Button
                    size="icon"
                    onClick={handleSearch}
                    disabled={!bst || !searchValue}
                    data-testid="button-search"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              {bst && (
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nodes:</span>
                    <span className="font-medium">{bst.getNodeCount()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Depth:</span>
                    <span className="font-medium">{bst.getMaxDepth()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operation Logs</CardTitle>
              <CardDescription>Step-by-step BST operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {operations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Build a tree to see operations
                  </p>
                ) : (
                  <div className="space-y-3">
                    {operations.slice(-10).map((op, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              op.type === "insert"
                                ? "default"
                                : op.type === "search"
                                ? "secondary"
                                : "outline"
                            }
                            size="sm"
                          >
                            {op.type}
                          </Badge>
                          <span className="text-sm font-mono">{op.value}</span>
                          {op.found !== undefined && (
                            <Badge
                              variant={op.found ? "default" : "destructive"}
                              size="sm"
                            >
                              {op.found ? "Found" : "Not Found"}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          {op.steps.map((step, j) => (
                            <div
                              key={j}
                              className="flex items-start gap-2 text-xs text-muted-foreground"
                            >
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span className="font-mono">{step}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comparisons: {op.comparisons}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tree Visualization</CardTitle>
            <CardDescription>
              {bst ? `BST with ${bst.getNodeCount()} nodes` : "Build a tree to visualize"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[500px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : !bst ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-center">
                <Binary className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Tree Built</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                  Select a key type and click "Build Tree" to visualize the BST structure
                </p>
              </div>
            ) : (
              <div className="overflow-auto">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="500"
                  viewBox="0 0 800 500"
                  className="min-w-[600px]"
                >
                  {renderTree()}
                </svg>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {bst && (
        <Card>
          <CardHeader>
            <CardTitle>Traversals</CardTitle>
            <CardDescription>View different tree traversal orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">In-Order (Sorted)</h4>
                <div className="flex flex-wrap gap-1">
                  {bst.inOrderTraversal().map((node, i) => (
                    <Badge key={i} variant="outline" size="sm" className="font-mono">
                      {node.value}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Pre-Order</h4>
                <div className="flex flex-wrap gap-1">
                  {bst.preOrderTraversal().map((node, i) => (
                    <Badge key={i} variant="outline" size="sm" className="font-mono">
                      {node.value}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Post-Order</h4>
                <div className="flex flex-wrap gap-1">
                  {bst.postOrderTraversal().map((node, i) => (
                    <Badge key={i} variant="outline" size="sm" className="font-mono">
                      {node.value}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
