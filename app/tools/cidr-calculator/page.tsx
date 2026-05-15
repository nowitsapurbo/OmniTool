"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Globe, Server, Calculator } from "lucide-react";

interface SubnetInfo {
  cidr: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  isPrivate: boolean;
  binaryMask: string;
}

export default function CIDRCalculatorPage() {
  const [ipAddress, setIpAddress] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState(24);
  const [subnetInfo, setSubnetInfo] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState("");
  const [subnetCount, setSubnetCount] = useState(4);
  const [subnets, setSubnets] = useState<SubnetInfo[]>([]);

  const parseIP = (ip: string): number[] | null => {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }
    return parts;
  };

  const ipToNumber = (ip: number[]): number => {
    return (ip[0] << 24) + (ip[1] << 16) + (ip[2] << 8) + ip[3];
  };

  const numberToIP = (num: number): string => {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join(".");
  };

  const calculateSubnet = useCallback((ip: string, cidr: number): SubnetInfo | null => {
    const ipParts = parseIP(ip);
    if (!ipParts) return null;

    const ipNum = ipToNumber(ipParts);
    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = (~mask) >>> 0;
    
    const networkNum = (ipNum & mask) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;
    
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : totalHosts - 2;
    
    const firstHost = cidr >= 31 ? networkNum : networkNum + 1;
    const lastHost = cidr >= 31 ? broadcastNum : broadcastNum - 1;

    // Determine IP class
    let ipClass = "Unknown";
    if (ipParts[0] >= 1 && ipParts[0] <= 126) ipClass = "A";
    else if (ipParts[0] >= 128 && ipParts[0] <= 191) ipClass = "B";
    else if (ipParts[0] >= 192 && ipParts[0] <= 223) ipClass = "C";
    else if (ipParts[0] >= 224 && ipParts[0] <= 239) ipClass = "D (Multicast)";
    else if (ipParts[0] >= 240 && ipParts[0] <= 255) ipClass = "E (Reserved)";

    // Check if private
    const isPrivate = (
      (ipParts[0] === 10) ||
      (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
      (ipParts[0] === 192 && ipParts[1] === 168) ||
      (ipParts[0] === 127)
    );

    // Binary mask
    const binaryMask = mask.toString(2).padStart(32, "0").match(/.{8}/g)!.join(".");

    return {
      cidr: `${numberToIP(networkNum)}/${cidr}`,
      networkAddress: numberToIP(networkNum),
      broadcastAddress: numberToIP(broadcastNum),
      firstHost: numberToIP(firstHost),
      lastHost: numberToIP(lastHost),
      subnetMask: numberToIP(mask),
      wildcardMask: numberToIP(wildcardNum),
      totalHosts,
      usableHosts,
      ipClass,
      isPrivate,
      binaryMask
    };
  }, []);

  const calculateSubnets = useCallback((ip: string, cidr: number, count: number): SubnetInfo[] => {
    const bitsNeeded = Math.ceil(Math.log2(count));
    const newPrefix = cidr + bitsNeeded;
    
    if (newPrefix > 30) return [];

    const ipParts = parseIP(ip);
    if (!ipParts) return [];

    const baseNetwork = (ipToNumber(ipParts) & ((~0 << (32 - cidr)) >>> 0)) >>> 0;
    const subnetSize = Math.pow(2, 32 - newPrefix);
    
    const results: SubnetInfo[] = [];
    for (let i = 0; i < count; i++) {
      const subnetNetwork = baseNetwork + (i * subnetSize);
      const subnetIP = numberToIP(subnetNetwork);
      const info = calculateSubnet(subnetIP, newPrefix);
      if (info) results.push(info);
    }
    
    return results;
  }, [calculateSubnet]);

  useEffect(() => {
    const info = calculateSubnet(ipAddress, prefix);
    if (info) {
      setSubnetInfo(info);
      setError("");
    } else {
      setSubnetInfo(null);
      setError("Invalid IP address");
    }
  }, [ipAddress, prefix, calculateSubnet]);

  useEffect(() => {
    if (subnetInfo) {
      setSubnets(calculateSubnets(ipAddress, prefix, subnetCount));
    }
  }, [ipAddress, prefix, subnetCount, subnetInfo, calculateSubnets]);

  const commonSubnets = [
    { prefix: 8, name: "/8 - Class A" },
    { prefix: 16, name: "/16 - Class B" },
    { prefix: 24, name: "/24 - Class C" },
    { prefix: 25, name: "/25 - 128 hosts" },
    { prefix: 26, name: "/26 - 64 hosts" },
    { prefix: 27, name: "/27 - 32 hosts" },
    { prefix: 28, name: "/28 - 16 hosts" },
    { prefix: 29, name: "/29 - 8 hosts" },
    { prefix: 30, name: "/30 - 4 hosts (P2P)" },
  ];

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Network}
        name="CIDR Calculator"
        description="Calculate subnets, network ranges, and perform IP address analysis"
        suite="Engineering"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Input */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="192.168.1.0"
                  className="font-mono"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <div className="space-y-2">
                <Label>CIDR Prefix: /{prefix}</Label>
                <Slider
                  value={[prefix]}
                  onValueChange={(v) => setPrefix(v[0])}
                  min={0}
                  max={32}
                  step={1}
                  className="py-4"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2">Quick select:</span>
              {commonSubnets.map(({ prefix: p, name }) => (
                <Button
                  key={p}
                  variant={prefix === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrefix(p)}
                  className="text-xs"
                >
                  {name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {subnetInfo && (
          <>
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Network Address</span>
                    <CopyButton value={subnetInfo.networkAddress} />
                  </div>
                  <p className="font-mono text-lg font-semibold">{subnetInfo.networkAddress}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Broadcast Address</span>
                    <CopyButton value={subnetInfo.broadcastAddress} />
                  </div>
                  <p className="font-mono text-lg font-semibold">{subnetInfo.broadcastAddress}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Subnet Mask</span>
                    <CopyButton value={subnetInfo.subnetMask} />
                  </div>
                  <p className="font-mono text-lg font-semibold">{subnetInfo.subnetMask}</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Wildcard Mask</span>
                    <CopyButton value={subnetInfo.wildcardMask} />
                  </div>
                  <p className="font-mono text-lg font-semibold">{subnetInfo.wildcardMask}</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Network Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">CIDR Notation</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{subnetInfo.cidr}</span>
                        <CopyButton value={subnetInfo.cidr} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">First Usable Host</span>
                      <span className="font-mono">{subnetInfo.firstHost}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Last Usable Host</span>
                      <span className="font-mono">{subnetInfo.lastHost}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Total Hosts</span>
                      <span className="font-mono">{subnetInfo.totalHosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Usable Hosts</span>
                      <span className="font-mono font-semibold text-primary">{subnetInfo.usableHosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">IP Class</span>
                      <Badge variant="secondary">{subnetInfo.ipClass}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Network Type</span>
                      <Badge variant={subnetInfo.isPrivate ? "outline" : "default"}>
                        {subnetInfo.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Binary Representation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Subnet Mask (Binary)</Label>
                      <div className="mt-1 p-3 rounded-lg bg-background/50 border border-border/50 font-mono text-sm break-all">
                        {subnetInfo.binaryMask}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Visual Representation</Label>
                      <div className="mt-1 flex gap-1">
                        {Array.from({ length: 32 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-6 rounded-sm ${
                              i < prefix ? "bg-primary" : "bg-muted"
                            }`}
                            title={i < prefix ? "Network bit" : "Host bit"}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Network ({prefix} bits)</span>
                        <span>Host ({32 - prefix} bits)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subnet Division */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Subnet Division
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Subnets:</Label>
                    <Select value={subnetCount.toString()} onValueChange={(v) => setSubnetCount(parseInt(v))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subnets.length > 0 ? (
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="font-semibold">#</TableHead>
                          <TableHead className="font-semibold">Network</TableHead>
                          <TableHead className="font-semibold">First Host</TableHead>
                          <TableHead className="font-semibold">Last Host</TableHead>
                          <TableHead className="font-semibold">Broadcast</TableHead>
                          <TableHead className="font-semibold text-right">Hosts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subnets.map((subnet, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{i + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{subnet.cidr}</TableCell>
                            <TableCell className="font-mono text-sm">{subnet.firstHost}</TableCell>
                            <TableCell className="font-mono text-sm">{subnet.lastHost}</TableCell>
                            <TableCell className="font-mono text-sm">{subnet.broadcastAddress}</TableCell>
                            <TableCell className="font-mono text-sm text-right">{subnet.usableHosts}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cannot create {subnetCount} subnets from /{prefix} network (not enough host bits)
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Add missing import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
