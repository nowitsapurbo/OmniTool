"use client";

import { useState, useCallback } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Database, Play, RefreshCw, Download, User, Mail, Phone, MapPin, Building, CreditCard } from "lucide-react";

type DataType = 'user' | 'product' | 'order' | 'company' | 'custom';

interface FieldConfig {
  name: string;
  type: string;
  enabled: boolean;
}

export default function MockGeneratorPage() {
  const [dataType, setDataType] = useState<DataType>('user');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");
  const [outputFormat, setOutputFormat] = useState<'json' | 'csv' | 'sql'>('json');
  const [customFields, setCustomFields] = useState<FieldConfig[]>([
    { name: 'id', type: 'uuid', enabled: true },
    { name: 'name', type: 'name', enabled: true },
    { name: 'email', type: 'email', enabled: true },
  ]);

  // Data generators
  const generators = {
    uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    }),
    id: () => Math.floor(Math.random() * 100000) + 1,
    name: () => {
      const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    },
    firstName: () => {
      const names = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
      return names[Math.floor(Math.random() * names.length)];
    },
    lastName: () => {
      const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
      return names[Math.floor(Math.random() * names.length)];
    },
    email: () => {
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
      const name = generators.firstName().toLowerCase() + generators.lastName().toLowerCase() + Math.floor(Math.random() * 100);
      return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
    phone: () => {
      const area = Math.floor(Math.random() * 900) + 100;
      const exchange = Math.floor(Math.random() * 900) + 100;
      const subscriber = Math.floor(Math.random() * 9000) + 1000;
      return `+1 (${area}) ${exchange}-${subscriber}`;
    },
    address: () => {
      const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Park Ave', 'Lake Dr'];
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
      const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'];
      const num = Math.floor(Math.random() * 9999) + 1;
      const idx = Math.floor(Math.random() * cities.length);
      const zip = Math.floor(Math.random() * 90000) + 10000;
      return `${num} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[idx]}, ${states[idx]} ${zip}`;
    },
    city: () => {
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'];
      return cities[Math.floor(Math.random() * cities.length)];
    },
    country: () => {
      const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'Mexico'];
      return countries[Math.floor(Math.random() * countries.length)];
    },
    company: () => {
      const prefixes = ['Global', 'Digital', 'Tech', 'Smart', 'Cloud', 'Data', 'Cyber', 'Net', 'Web', 'App'];
      const suffixes = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Enterprises', 'Corp', 'Inc', 'Labs', 'Studio', 'Group'];
      return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    },
    product: () => {
      const adjectives = ['Premium', 'Pro', 'Ultra', 'Smart', 'Wireless', 'Portable', 'Compact', 'Advanced'];
      const products = ['Laptop', 'Headphones', 'Keyboard', 'Mouse', 'Monitor', 'Tablet', 'Phone', 'Speaker', 'Camera', 'Watch'];
      return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${products[Math.floor(Math.random() * products.length)]}`;
    },
    price: () => (Math.random() * 1000).toFixed(2),
    quantity: () => Math.floor(Math.random() * 100) + 1,
    date: () => {
      const start = new Date(2020, 0, 1);
      const end = new Date();
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split('T')[0];
    },
    datetime: () => {
      const start = new Date(2020, 0, 1);
      const end = new Date();
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
    },
    boolean: () => Math.random() > 0.5,
    status: () => {
      const statuses = ['active', 'inactive', 'pending', 'completed', 'cancelled'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    },
    creditCard: () => {
      const prefixes = ['4', '5', '37', '6'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let number = prefix;
      while (number.length < 16) {
        number += Math.floor(Math.random() * 10);
      }
      return number.replace(/(.{4})/g, '$1 ').trim();
    },
    url: () => {
      const domains = ['example.com', 'test.org', 'sample.net', 'demo.io'];
      const paths = ['products', 'users', 'orders', 'api', 'dashboard'];
      return `https://${domains[Math.floor(Math.random() * domains.length)]}/${paths[Math.floor(Math.random() * paths.length)]}`;
    },
    avatar: () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`,
    paragraph: () => {
      const sentences = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.'
      ];
      return sentences.slice(0, Math.floor(Math.random() * 3) + 2).join(' ');
    },
  };

  const dataTemplates: Record<DataType, FieldConfig[]> = {
    user: [
      { name: 'id', type: 'uuid', enabled: true },
      { name: 'name', type: 'name', enabled: true },
      { name: 'email', type: 'email', enabled: true },
      { name: 'phone', type: 'phone', enabled: true },
      { name: 'address', type: 'address', enabled: true },
      { name: 'createdAt', type: 'datetime', enabled: true },
    ],
    product: [
      { name: 'id', type: 'uuid', enabled: true },
      { name: 'name', type: 'product', enabled: true },
      { name: 'price', type: 'price', enabled: true },
      { name: 'quantity', type: 'quantity', enabled: true },
      { name: 'status', type: 'status', enabled: true },
      { name: 'createdAt', type: 'date', enabled: true },
    ],
    order: [
      { name: 'id', type: 'uuid', enabled: true },
      { name: 'customer', type: 'name', enabled: true },
      { name: 'email', type: 'email', enabled: true },
      { name: 'product', type: 'product', enabled: true },
      { name: 'total', type: 'price', enabled: true },
      { name: 'status', type: 'status', enabled: true },
      { name: 'orderDate', type: 'datetime', enabled: true },
    ],
    company: [
      { name: 'id', type: 'uuid', enabled: true },
      { name: 'name', type: 'company', enabled: true },
      { name: 'city', type: 'city', enabled: true },
      { name: 'country', type: 'country', enabled: true },
      { name: 'website', type: 'url', enabled: true },
      { name: 'foundedDate', type: 'date', enabled: true },
    ],
    custom: customFields,
  };

  const generateData = useCallback(() => {
    const fields = dataType === 'custom' ? customFields : dataTemplates[dataType];
    const enabledFields = fields.filter(f => f.enabled);
    
    const data = Array.from({ length: count }, () => {
      const obj: Record<string, unknown> = {};
      enabledFields.forEach(field => {
        const generator = generators[field.type as keyof typeof generators];
        obj[field.name] = generator ? generator() : null;
      });
      return obj;
    });

    switch (outputFormat) {
      case 'json':
        setOutput(JSON.stringify(data, null, 2));
        break;
      case 'csv':
        if (data.length === 0) {
          setOutput('');
          break;
        }
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
        setOutput([headers, ...rows].join('\n'));
        break;
      case 'sql':
        const tableName = dataType === 'custom' ? 'custom_data' : `${dataType}s`;
        const columns = Object.keys(data[0] || {}).join(', ');
        const values = data.map(obj => {
          const vals = Object.values(obj).map(v => typeof v === 'string' ? `'${v}'` : v);
          return `(${vals.join(', ')})`;
        }).join(',\n  ');
        setOutput(`INSERT INTO ${tableName} (${columns})\nVALUES\n  ${values};`);
        break;
    }
  }, [dataType, count, outputFormat, customFields]);

  const downloadOutput = () => {
    const extensions = { json: 'json', csv: 'csv', sql: 'sql' };
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-data.${extensions[outputFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { name: `field${customFields.length + 1}`, type: 'name', enabled: true }]);
  };

  const updateCustomField = (index: number, updates: Partial<FieldConfig>) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const typeIcons: Record<string, React.ReactNode> = {
    user: <User className="h-4 w-4" />,
    product: <CreditCard className="h-4 w-4" />,
    order: <Building className="h-4 w-4" />,
    company: <Building className="h-4 w-4" />,
    custom: <Database className="h-4 w-4" />,
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Database}
        name="Mock Data Generator"
        description="Generate realistic mock data for testing and development"
        suite="Frontend"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Configuration */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Data Type</Label>
                <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" /> Users
                      </div>
                    </SelectItem>
                    <SelectItem value="product">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Products
                      </div>
                    </SelectItem>
                    <SelectItem value="order">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" /> Orders
                      </div>
                    </SelectItem>
                    <SelectItem value="company">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" /> Companies
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" /> Custom
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Record Count</Label>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as 'json' | 'csv' | 'sql')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="sql">SQL Insert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={generateData} className="flex-1 gap-2">
                  <Play className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fields Configuration */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Fields</CardTitle>
              {dataType === 'custom' && (
                <Button variant="outline" size="sm" onClick={addCustomField}>
                  Add Field
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(dataType === 'custom' ? customFields : dataTemplates[dataType]).map((field, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
                  <Checkbox
                    checked={field.enabled}
                    onCheckedChange={(checked) => {
                      if (dataType === 'custom') {
                        updateCustomField(index, { enabled: !!checked });
                      }
                    }}
                    disabled={dataType !== 'custom'}
                  />
                  {dataType === 'custom' ? (
                    <>
                      <Input
                        value={field.name}
                        onChange={(e) => updateCustomField(index, { name: e.target.value })}
                        className="w-32"
                        placeholder="Field name"
                      />
                      <Select value={field.type} onValueChange={(v) => updateCustomField(index, { type: v })}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(generators).map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-sm w-32">{field.name}</span>
                      <Badge variant="secondary">{field.type}</Badge>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Generated Data</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateData} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={downloadOutput} className="gap-2" disabled={!output}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <CopyButton value={output} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              placeholder="Click 'Generate' to create mock data..."
              className="min-h-[400px] font-mono text-sm bg-background/50 resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
