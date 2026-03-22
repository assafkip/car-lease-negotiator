#!/usr/bin/env node
// Lease Deal Checker
// Validates dealer quotes, catches money factor markup, scores the deal.
//
// Usage: node tools/check-deal.js <msrp> <selling_price> <incentives> [mf] [rv] [term] [tax_rate] [buy_rate_mf]
// Example: node tools/check-deal.js 61395 57533 12750
// Defaults: MF=0.00199, RV=0.64, term=36, tax=0.09, buy_rate=0.00199

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Lease Deal Checker - Validate dealer quotes and catch MF markup\n');
  console.log('Usage: node tools/check-deal.js <msrp> <selling_price> <incentives> [mf] [rv] [term] [tax_rate] [buy_rate_mf]');
  console.log('\nExamples:');
  console.log('  node tools/check-deal.js 61395 57533 12750              # Basic check at buy rate');
  console.log('  node tools/check-deal.js 61395 57533 12750 0.00250      # Check with dealer MF');
  console.log('  node tools/check-deal.js 61395 57533 12750 0.00199 0.64 36 0.09  # Full params');
  process.exit(1);
}

const msrp = parseFloat(args[0]);
const sellingPrice = parseFloat(args[1]);
const incentives = parseFloat(args[2]);
const mf = parseFloat(args[3] || '0.00199');
const rv = parseFloat(args[4] || '0.64');
const term = parseInt(args[5] || '36');
const taxRate = parseFloat(args[6] || '0.09');
const buyRateMF = parseFloat(args[7] || '0.00199');

const discountPct = ((msrp - sellingPrice) / msrp * 100).toFixed(1);
const residualValue = msrp * rv;
const netCapCost = sellingPrice - incentives;
const depreciation = (netCapCost - residualValue) / term;
const rentCharge = (netCapCost + residualValue) * mf;
const preTax = depreciation + rentCharge;
const monthlyTax = preTax * taxRate;
const totalPayment = preTax + monthlyTax;
const apr = (mf * 2400).toFixed(2);
const perTenK = (totalPayment / (msrp / 10000)).toFixed(0);

console.log('\n=== LEASE DEAL CHECK ===\n');
console.log(`MSRP:            $${msrp.toLocaleString()}`);
console.log(`Selling Price:   $${sellingPrice.toLocaleString()} (${discountPct}% off)`);
console.log(`Incentives:      -$${incentives.toLocaleString()}`);
console.log(`Net Cap Cost:    $${netCapCost.toLocaleString()}`);
console.log(`Residual (${(rv*100).toFixed(0)}%):  $${residualValue.toLocaleString()}`);
console.log(`MF:              ${mf} (${apr}% APR)`);
console.log(`Term:            ${term} months\n`);
console.log(`Depreciation/mo: $${depreciation.toFixed(2)}`);
console.log(`Rent Charge/mo:  $${rentCharge.toFixed(2)}`);
console.log(`Pre-tax:         $${preTax.toFixed(2)}`);
console.log(`Tax (${(taxRate*100).toFixed(0)}%):        $${monthlyTax.toFixed(2)}`);
console.log(`\nTOTAL PAYMENT:   $${totalPayment.toFixed(2)}/mo`);
console.log(`$/10K MSRP:      $${perTenK}/mo`);

// Verdict
const benchmark = 125;
if (parseInt(perTenK) <= benchmark) {
  console.log(`\nVERDICT: GOOD DEAL (under $${benchmark}/10K benchmark)`);
} else if (parseInt(perTenK) <= 150) {
  console.log(`\nVERDICT: AVERAGE (over $${benchmark}/10K benchmark)`);
} else {
  console.log(`\nVERDICT: BAD DEAL (way over $${benchmark}/10K benchmark)`);
}

// MF markup check
if (mf > buyRateMF) {
  const mfMarkup = mf - buyRateMF;
  const markupCost = (netCapCost + residualValue) * mfMarkup;
  console.log(`\nMF MARKUP WARNING: MF is ${mfMarkup.toFixed(5)} above buy rate (${buyRateMF})`);
  console.log(`  That costs you $${markupCost.toFixed(2)}/mo extra`);
  console.log(`  At buy rate, payment would be $${(totalPayment - markupCost * (1 + taxRate)).toFixed(2)}/mo`);
}

// Reverse-engineer: what MF produces a given payment?
if (process.argv.includes('--reverse')) {
  const targetPayment = parseFloat(process.argv[process.argv.indexOf('--reverse') + 1]);
  const targetPreTax = targetPayment / (1 + taxRate);
  const impliedRent = targetPreTax - depreciation;
  const impliedMF = impliedRent / (netCapCost + residualValue);
  const impliedAPR = (impliedMF * 2400).toFixed(2);
  console.log(`\n=== REVERSE ENGINEER ===`);
  console.log(`Target payment:  $${targetPayment}/mo`);
  console.log(`Implied MF:      ${impliedMF.toFixed(5)}`);
  console.log(`Implied APR:     ${impliedAPR}%`);
  if (impliedMF > buyRateMF) {
    console.log(`MF markup:       ${(impliedMF - buyRateMF).toFixed(5)} above buy rate`);
  }
}
