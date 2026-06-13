import { DataStandard, FieldMapping } from '@/types';

export interface MatchResult {
  fieldName: string;
  standard: DataStandard;
  similarity: number;
  matchReasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  return dp[m][n];
}

function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/_/g, '').replace(/-/g, '');
  const s2 = str2.toLowerCase().replace(/_/g, '').replace(/-/g, '');

  if (s1 === s2) return 1;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
}

function hasSubstringMatch(fieldName: string, standardName: string): boolean {
  const f = fieldName.toLowerCase().replace(/_/g, '');
  const s = standardName.toLowerCase().replace(/_/g, '');
  return f.includes(s) || s.includes(f);
}

function getCommonAbbreviations(): Record<string, string> {
  return {
    cust: 'customer',
    id: 'identity',
    no: 'number',
    nm: 'name',
    amt: 'amount',
    qty: 'quantity',
    txn: 'transaction',
    dept: 'department',
    emp: 'employee',
    prd: 'product',
    inv: 'inventory',
    ord: 'order',
    sys: 'system',
    conf: 'config',
    info: 'information',
    desc: 'description',
    addr: 'address',
    mobile: 'phone',
    tel: 'phone',
    is_deleted: 'is_deleted',
    del: 'delete',
    crt: 'create',
    upd: 'update',
    gmt: '',
    dt: 'date',
    tm: 'time',
  };
}

function normalizeFieldName(name: string): string {
  let result = name.toLowerCase();
  const abbrs = getCommonAbbreviations();

  const parts = result.split('_');
  const normalizedParts = parts.map((part) => abbrs[part] || part);

  return normalizedParts.filter(Boolean).join('_');
}

export function findBestMatch(
  fieldName: string,
  standards: DataStandard[]
): MatchResult | null {
  if (standards.length === 0) return null;

  const results: { standard: DataStandard; score: number; reasons: string[] }[] = [];

  for (const standard of standards) {
    const reasons: string[] = [];
    let totalScore = 0;
    let weightSum = 0;

    // 英文名相似度 (权重 0.4)
    const nameSim = stringSimilarity(fieldName, standard.nameEn);
    totalScore += nameSim * 0.4;
    weightSum += 0.4;
    if (nameSim > 0.8) {
      reasons.push(`英文名高度相似 (${(nameSim * 100).toFixed(0)}%)`);
    } else if (nameSim > 0.5) {
      reasons.push(`英文名部分相似 (${(nameSim * 100).toFixed(0)}%)`);
    }

    // 归一化后名称相似度 (权重 0.2)
    const normalizedField = normalizeFieldName(fieldName);
    const normalizedStandard = normalizeFieldName(standard.nameEn);
    const normSim = stringSimilarity(normalizedField, normalizedStandard);
    totalScore += normSim * 0.2;
    weightSum += 0.2;
    if (normSim > nameSim && normSim > 0.7) {
      reasons.push('经过缩写词规范化后匹配度提升');
    }

    // 子串匹配 (权重 0.2)
    if (hasSubstringMatch(fieldName, standard.nameEn)) {
      totalScore += 0.2;
      weightSum += 0.2;
      reasons.push('字段名包含标准名称或被包含');
    }

    // 中文名关键词匹配 (权重 0.15)
    const cnKeywords = standard.nameCn.replace(/\s/g, '');
    if (cnKeywords.length > 0) {
      // 这个只是辅助，可以降低权重
      totalScore += 0.05;
      weightSum += 0.05;
    }

    // 数据类型提示
    // 如果字段类型看起来像数字，标准类型是number则加分
    const lowerName = fieldName.toLowerCase();
    if (
      (lowerName.includes('amt') ||
        lowerName.includes('amount') ||
        lowerName.includes('qty') ||
        lowerName.includes('count') ||
        lowerName.includes('num') ||
        lowerName.includes('price')) &&
      standard.dataType === 'number'
    ) {
      totalScore += 0.05;
      weightSum += 0.05;
      reasons.push('数据类型语义匹配（数值型）');
    }

    if (
      (lowerName.includes('time') ||
        lowerName.includes('date') ||
        lowerName.includes('dt') ||
        lowerName.includes('gmt') ||
        lowerName.includes('crt') ||
        lowerName.includes('upd')) &&
      standard.dataType === 'date'
    ) {
      totalScore += 0.05;
      weightSum += 0.05;
      reasons.push('数据类型语义匹配（日期型）');
    }

    if (
      (lowerName.includes('is_') ||
        lowerName.includes('has_') ||
        lowerName.includes('flag') ||
        lowerName.includes('deleted')) &&
      standard.dataType === 'boolean'
    ) {
      totalScore += 0.05;
      weightSum += 0.05;
      reasons.push('数据类型语义匹配（布尔型）');
    }

    const finalScore = weightSum > 0 ? totalScore / weightSum : 0;

    if (finalScore > 0.3) {
      results.push({ standard, score: finalScore, reasons });
    }
  }

  if (results.length === 0) return null;

  results.sort((a, b) => b.score - a.score);
  const best = results[0];

  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (best.score >= 0.7) confidence = 'high';
  else if (best.score >= 0.5) confidence = 'medium';

  if (best.reasons.length === 0) {
    best.reasons.push('基础名称相似度匹配');
  }

  return {
    fieldName,
    standard: best.standard,
    similarity: best.score,
    matchReasons: best.reasons,
    confidence,
  };
}

export function batchFindReplacements(
  fieldNames: string[],
  standards: DataStandard[]
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const fieldName of fieldNames) {
    const match = findBestMatch(fieldName.trim(), standards);
    if (match) {
      results.push(match);
    }
  }

  return results.sort((a, b) => b.similarity - a.similarity);
}

export function analyzeFieldMappings(
  mappings: FieldMapping[],
  standards: DataStandard[]
): { totalAnalyzed: number; suggestedCount: number; highConfidence: number; mediumConfidence: number; lowConfidence: number } {
  let suggestedCount = 0;
  let highConfidence = 0;
  let mediumConfidence = 0;
  let lowConfidence = 0;

  const unmapped = mappings.filter((m) => m.mappingStatus !== 'mapped');

  for (const mapping of unmapped) {
    const match = findBestMatch(mapping.fieldName, standards);
    if (match) {
      suggestedCount++;
      if (match.confidence === 'high') highConfidence++;
      else if (match.confidence === 'medium') mediumConfidence++;
      else lowConfidence++;
    }
  }

  return {
    totalAnalyzed: unmapped.length,
    suggestedCount,
    highConfidence,
    mediumConfidence,
    lowConfidence,
  };
}
