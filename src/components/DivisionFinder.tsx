import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, DollarSign, Clock, ArrowRight, RotateCcw, ChevronDown } from "lucide-react";

interface DivisionResult {
  name: string;
  ageRange: string;
  description: string;
  schedule: string;
  cost: string;
}

const getDivisionFromBirthYear = (birthYear: number): DivisionResult | null => {
  const currentYear = 2026; // Season year
  const age = currentYear - birthYear;

  if (age >= 4 && age <= 6) {
    return {
      name: "T-Ball",
      ageRange: "Ages 4-6",
      description: "Introduction to baseball fundamentals in a fun, supportive environment. Coach-pitch format with focus on basic skills.",
      schedule: "1 practice + Saturday games",
      cost: "$195"
    };
  } else if (age >= 7 && age <= 8) {
    return {
      name: "Pinto",
      ageRange: "Ages 7-8",
      description: "Player-pitch baseball with continued skill development. Players begin learning positions and game strategy.",
      schedule: "2 practices + 1-2 games per week",
      cost: "$250"
    };
  } else if (age >= 9 && age <= 10) {
    return {
      name: "Mustang",
      ageRange: "Ages 9-10",
      description: "Competitive play with full rules. Focus on team concepts, situational baseball, and advanced skills.",
      schedule: "2 practices + 1-2 games per week",
      cost: "$275"
    };
  } else if (age >= 11 && age <= 12) {
    return {
      name: "Bronco",
      ageRange: "Ages 11-12",
      description: "Advanced competitive baseball on larger fields. Preparation for middle school baseball programs.",
      schedule: "2-3 practices + 2 games per week",
      cost: "$290"
    };
  } else if (age >= 13 && age <= 14) {
    return {
      name: "Pony",
      ageRange: "Ages 13-14",
      description: "High-level youth baseball for experienced players. Full regulation field with advanced competition.",
      schedule: "2-3 practices + 2 games per week",
      cost: "$335"
    };
  }
  
  return null;
};

// Pre-build options: years 2022 down to 2010 with division label
const BIRTH_YEAR_OPTIONS = Array.from({ length: 13 }, (_, i) => {
  const year = 2022 - i;
  const division = getDivisionFromBirthYear(year);
  return {
    value: String(year),
    label: division ? `${year} — ${division.ageRange} (${division.name})` : `${year}`,
  };
});

const DivisionFinder = () => {
  const [result, setResult] = useState<DivisionResult | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");

  const handleValueChange = (value: string) => {
    setSelectedYear(value);
    const year = parseInt(value);
    const division = getDivisionFromBirthYear(year);
    setResult(division);
  };

  const handleReset = () => {
    setSelectedYear("");
    setResult(null);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ChevronDown className="h-5 w-5 text-primary" />
          Find Your Division
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your child's birth year to instantly find the right division
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedYear} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select birth year…" />
          </SelectTrigger>
          <SelectContent>
            {BIRTH_YEAR_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {result && (
          <div className="mt-4 space-y-4 animate-in fade-in-50 slide-in-from-bottom-2">
            <div className="p-4 rounded-lg bg-primary text-primary-foreground">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{result.name}</h3>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  {result.ageRange}
                </Badge>
              </div>
              <p className="text-sm opacity-90 mb-4">{result.description}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{result.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{result.cost} per season</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild className="flex-1">
                <Link to="/in-house/registration">
                  Register for {result.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={handleReset} className="shrink-0">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Another Year
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DivisionFinder;
