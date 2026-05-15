"use client";

import { useState, useCallback } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Eraser, Table, Database } from "lucide-react";

type SQLDialect = "standard" | "mysql" | "postgresql" | "sqlite";

export default function SQLFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState<SQLDialect>("standard");
  const [indentSize, setIndentSize] = useState("2");
  const [uppercase, setUppercase] = useState(true);
  const [analysis, setAnalysis] = useState<{
    tables: string[];
    columns: string[];
    operations: string[];
    joins: number;
  } | null>(null);

  const sqlKeywords = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "BETWEEN",
    "LIKE", "IS", "NULL", "ORDER", "BY", "GROUP", "HAVING", "LIMIT",
    "OFFSET", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "FULL",
    "ON", "AS", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
    "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE",
    "TABLE", "DROP", "ALTER", "ADD", "INDEX", "PRIMARY", "KEY",
    "FOREIGN", "REFERENCES", "CONSTRAINT", "UNIQUE", "DEFAULT",
    "AUTO_INCREMENT", "CASCADE", "UNION", "ALL", "EXISTS", "CASE",
    "WHEN", "THEN", "ELSE", "END", "ASC", "DESC", "NULLS", "FIRST", "LAST"
  ];

  const formatSQL = useCallback((sql: string): string => {
    if (!sql.trim()) return "";

    let formatted = sql.trim();
    
    // Normalize whitespace
    formatted = formatted.replace(/\s+/g, " ");
    
    // Handle keywords case
    if (uppercase) {
      sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        formatted = formatted.replace(regex, keyword);
      });
    } else {
      sqlKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        formatted = formatted.replace(regex, keyword.toLowerCase());
      });
    }
    
    const indent = " ".repeat(parseInt(indentSize));
    
    // Add newlines before major clauses
    const majorClauses = ["SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "ON", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "DROP TABLE", "ALTER TABLE"];
    
    majorClauses.forEach(clause => {
      const regex = new RegExp(`\\s+(${clause})\\b`, "gi");
      formatted = formatted.replace(regex, `\n${clause}`);
    });
    
    // Indent subclauses
    const subClauses = ["AND", "OR", "ON"];
    subClauses.forEach(clause => {
      const regex = new RegExp(`\n(${clause})\\b`, "gi");
      formatted = formatted.replace(regex, `\n${indent}${clause}`);
    });
    
    // Handle commas in SELECT
    formatted = formatted.replace(/,\s*/g, ",\n" + indent);
    
    // Clean up multiple newlines
    formatted = formatted.replace(/\n\s*\n/g, "\n");
    
    return formatted.trim();
  }, [uppercase, indentSize]);

  const analyzeSQL = useCallback((sql: string) => {
    if (!sql.trim()) {
      setAnalysis(null);
      return;
    }

    const upperSQL = sql.toUpperCase();
    
    // Extract tables
    const tableMatches = sql.match(/(?:FROM|JOIN|INTO|UPDATE|TABLE)\s+([`"']?\w+[`"']?)/gi) || [];
    const tables = [...new Set(tableMatches.map(m => m.split(/\s+/)[1]?.replace(/[`"']/g, "") || ""))].filter(Boolean);
    
    // Extract columns (simplified)
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/is);
    let columns: string[] = [];
    if (selectMatch) {
      columns = selectMatch[1]
        .split(",")
        .map(c => c.trim().split(/\s+AS\s+/i).pop() || c.trim())
        .map(c => c.replace(/[`"']/g, ""))
        .filter(c => c !== "*");
    }
    
    // Detect operations
    const operations: string[] = [];
    if (upperSQL.includes("SELECT")) operations.push("SELECT");
    if (upperSQL.includes("INSERT")) operations.push("INSERT");
    if (upperSQL.includes("UPDATE")) operations.push("UPDATE");
    if (upperSQL.includes("DELETE")) operations.push("DELETE");
    if (upperSQL.includes("CREATE")) operations.push("CREATE");
    if (upperSQL.includes("DROP")) operations.push("DROP");
    if (upperSQL.includes("ALTER")) operations.push("ALTER");
    
    // Count joins
    const joins = (upperSQL.match(/\bJOIN\b/g) || []).length;
    
    setAnalysis({ tables, columns, operations, joins });
  }, []);

  const handleFormat = () => {
    const formatted = formatSQL(input);
    setOutput(formatted);
    analyzeSQL(input);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setAnalysis(null);
  };

  const sampleQueries: Record<string, string> = {
    select: `select u.id, u.name, u.email, count(o.id) as order_count, sum(o.total) as total_spent from users u left join orders o on u.id = o.user_id where u.created_at > '2024-01-01' and u.status = 'active' group by u.id, u.name, u.email having count(o.id) > 5 order by total_spent desc limit 10`,
    insert: `insert into users (name, email, password, created_at) values ('John Doe', 'john@example.com', 'hashed_password', now())`,
    update: `update products set price = price * 1.1, updated_at = now() where category_id in (select id from categories where name = 'Electronics') and stock > 0`,
    create: `create table orders (id int primary key auto_increment, user_id int not null, total decimal(10,2) default 0.00, status varchar(50) default 'pending', created_at timestamp default current_timestamp, foreign key (user_id) references users(id) on delete cascade)`
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Database}
        name="SQL Formatter"
        description="Format and beautify SQL queries with syntax analysis"
        suite="Engineering"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Controls */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="dialect" className="text-sm whitespace-nowrap">Dialect:</Label>
                <Select value={dialect} onValueChange={(v) => setDialect(v as SQLDialect)}>
                  <SelectTrigger id="dialect" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="indent" className="text-sm whitespace-nowrap">Indent:</Label>
                <Select value={indentSize} onValueChange={setIndentSize}>
                  <SelectTrigger id="indent" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={uppercase ? "default" : "outline"}
                size="sm"
                onClick={() => setUppercase(!uppercase)}
              >
                UPPERCASE
              </Button>

              <div className="flex-1" />

              <div className="flex gap-2">
                <Button onClick={handleFormat} className="gap-2">
                  <Play className="h-4 w-4" />
                  Format
                </Button>
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <Eraser className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Load sample:</span>
          {Object.entries(sampleQueries).map(([key, query]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => setInput(query)}
              className="text-xs capitalize"
            >
              {key}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Input SQL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your SQL query here..."
                className="min-h-[300px] font-mono text-sm bg-background/50 resize-none"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Formatted SQL
                </CardTitle>
                <CopyButton value={output} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                placeholder="Formatted SQL will appear here..."
                className="min-h-[300px] font-mono text-sm bg-background/50 resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Analysis */}
        {analysis && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Query Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tables">Tables ({analysis.tables.length})</TabsTrigger>
                  <TabsTrigger value="columns">Columns ({analysis.columns.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-2xl font-bold text-primary">{analysis.operations.length}</div>
                      <div className="text-sm text-muted-foreground">Operations</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.operations.map(op => (
                          <Badge key={op} variant="secondary" className="text-xs">{op}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-2xl font-bold text-primary">{analysis.tables.length}</div>
                      <div className="text-sm text-muted-foreground">Tables</div>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-2xl font-bold text-primary">{analysis.columns.length}</div>
                      <div className="text-sm text-muted-foreground">Columns</div>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                      <div className="text-2xl font-bold text-primary">{analysis.joins}</div>
                      <div className="text-sm text-muted-foreground">Joins</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tables">
                  <div className="flex flex-wrap gap-2">
                    {analysis.tables.length > 0 ? (
                      analysis.tables.map(table => (
                        <Badge key={table} variant="outline" className="font-mono">
                          {table}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tables detected</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="columns">
                  <div className="flex flex-wrap gap-2">
                    {analysis.columns.length > 0 ? (
                      analysis.columns.map(col => (
                        <Badge key={col} variant="outline" className="font-mono">
                          {col}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific columns detected (might be using *)</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
