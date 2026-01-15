#!/bin/bash
# Script to apply LLM evaluation migrations to remote Supabase

echo "This script will help you apply the evaluation migrations to your Supabase database."
echo ""
echo "You need to do one of the following:"
echo ""
echo "Option 1: Apply via Supabase Dashboard (Recommended)"
echo "  1. Go to: https://app.supabase.com/project/xvgiansmsshnlcfglswl/sql/new"
echo "  2. Copy contents of supabase/migrations/007_add_evaluations.sql"
echo "  3. Paste and run"
echo "  4. Copy contents of supabase/migrations/008_evaluation_history.sql"
echo "  5. Paste and run"
echo ""
echo "Option 2: Use Supabase CLI"
echo "  Run: npx supabase link --project-ref xvgiansmsshnlcfglswl"
echo "  Then: npx supabase db push"
echo ""
read -p "Press Enter to continue..."
