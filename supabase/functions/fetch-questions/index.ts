import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching questions from Google Sheets...');
    
    // Google Sheets CSV export URL
    const sheetId = '1-5NpzNwUiAsl_BPruHygyUbpO3LHkWr8E08fqkypOcU';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch from Google Sheets:', response.status);
      throw new Error('Failed to fetch data from Google Sheets');
    }
    
    const csvText = await response.text();
    console.log('Successfully fetched CSV data');
    
    return new Response(
      csvText,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'text/csv'
        } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-questions function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
