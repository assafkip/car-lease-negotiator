# Car Lease Negotiator

A Claude Code skill for negotiating car leases over email. Uses Chris Voss's tactical negotiation methodology ("Never Split the Difference") adapted for written dealer communication.

## What's Included

- **Negotiation Skill** (`.claude/skills/car-negotiator/`) - Voss-based tactics adapted for email: labeling, calibrated questions, accusation audits, no-oriented questions, Ackerman bargaining, tactical silence
- **Lease Calculator** (`tools/check-deal.js`) - Validate any dealer quote instantly. Catches money factor markup, calculates true payment, scores the deal.
- **Voss Tactics Reference** - Full playbook with car-specific scripts for 9 common dealer scenarios

## Quick Start

```bash
# Clone into your project
git clone https://github.com/assafkip/car-lease-negotiator.git
cd car-lease-negotiator

# Install the lease calculator dependency
npm install

# Create your car spec (copy and edit the example)
cp car-spec.example.json car-spec.json

# Check a dealer quote
node tools/check-deal.js 61395 57533 12750
```

## Using the Skill

Once installed, paste any dealer email into Claude Code and ask "what should I reply?" The skill will:

1. Identify the right tactic for the situation
2. Generate a copy-paste email reply
3. Suggest timing (send now vs wait)
4. Predict the dealer's likely response and prepare your next move

## The Deal Checker

```bash
# Basic usage: msrp, selling_price, incentives
node tools/check-deal.js 61395 57533 12750

# Full usage: msrp, selling_price, incentives, mf, rv, term, tax_rate
node tools/check-deal.js 61395 57533 12750 0.00250 0.64 36 0.09
```

Output includes:
- Full payment breakdown (depreciation, rent charge, tax)
- Money factor markup detection (compares to buy rate)
- $/10K MSRP benchmark score
- Deal verdict (good / average / bad)

## Negotiation Tactics

The skill implements these Voss techniques for email:

| Technique | When to Use |
|---|---|
| Labeling | Dealer pushes back or shows constraint |
| Calibrated Questions | Dealer makes demands or tries to close |
| No-Oriented Questions | Making a bold ask |
| Accusation Audit | First email or re-engaging after stall |
| Mirroring | Dealer makes a claim you want elaborated |
| Tactical Silence | After making an offer (wait 4-24 hours) |
| Ackerman Bargaining | Price negotiation rounds |
| Loss Aversion | You have competing options |

## Configuration

Edit `car-spec.json` with your target vehicle and lease terms. The skill reads this file to calibrate all negotiation language.

## License

MIT
