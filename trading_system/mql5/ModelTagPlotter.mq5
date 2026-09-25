//+------------------------------------------------------------------+
//| ModelTagPlotter.mq5                                              |
//| Draws BUY/SELL arrows + "[CLASSIC MODEL]" / "[ADVANCED MODEL]"   |
//| labels on the chart for every deal the Python bot executes.      |
//|                                                                  |
//| main.py appends one line per deal to                             |
//|   <MT5 common data folder>\Files\model_tags.csv                  |
//| This indicator re-reads that file every few seconds.             |
//|                                                                  |
//| Install: MetaEditor -> File -> Open Data Folder ->               |
//|   MQL5\Indicators\ModelTagPlotter.mq5, press F7 to compile,      |
//|   then drag it from Navigator -> Indicators onto the chart.      |
//+------------------------------------------------------------------+
#property copyright   "Multi-Model Algo Trader"
#property version     "1.00"
#property description "Tags executed deals with the model that generated them"
#property indicator_chart_window
#property indicator_plots 0

input string InpFileName      = "model_tags.csv";  // File in the COMMON Files folder
input int    InpRefreshSec    = 2;                 // Refresh interval (seconds)
input color  InpClassicColor  = clrDodgerBlue;     // Classic Model color
input color  InpAdvancedColor = clrMediumOrchid;   // Advanced Model color
input int    InpFontSize      = 8;                 // Label font size
input bool   InpDrawSLTP      = true;              // Draw short SL/TP dashes

const string PREFIX = "MMTAG_";

//+------------------------------------------------------------------+
int OnInit()
  {
   EventSetTimer(MathMax(1, InpRefreshSec));
   DrawTags();
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   EventKillTimer();
   ObjectsDeleteAll(0, PREFIX);
   ChartRedraw();
  }

//+------------------------------------------------------------------+
void OnTimer()
  {
   DrawTags();
  }

//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
  {
   return(rates_total);
  }

//+------------------------------------------------------------------+
//| Reads the CSV and draws any deal for the current chart symbol     |
//+------------------------------------------------------------------+
void DrawTags()
  {
   int h = FileOpen(InpFileName,
                    FILE_READ | FILE_CSV | FILE_ANSI | FILE_COMMON | FILE_SHARE_READ | FILE_SHARE_WRITE,
                    ',');
   if(h == INVALID_HANDLE)
      return;

   // Skip the header line
   do
     {
      FileReadString(h);
     }
   while(!FileIsLineEnding(h) && !FileIsEnding(h));

   while(!FileIsEnding(h))
     {
      string ticket = FileReadString(h);
      if(FileIsEnding(h) && ticket == "")
         break;
      string symbol = FileReadString(h);
      long   t      = StringToInteger(FileReadString(h));
      double price  = StringToDouble(FileReadString(h));
      string signal = FileReadString(h);
      string model  = FileReadString(h);
      string prob   = FileReadString(h);
      double sl     = StringToDouble(FileReadString(h));
      double tp     = StringToDouble(FileReadString(h));

      if(ticket == "" || symbol != _Symbol)
         continue;

      DrawOne(ticket, (datetime)t, price, signal, model, prob, sl, tp);
     }
   FileClose(h);
   ChartRedraw();
  }

//+------------------------------------------------------------------+
void DrawOne(const string ticket, const datetime t, const double price,
             const string signal, const string model, const string prob,
             const double sl, const double tp)
  {
   string base  = PREFIX + ticket;
   bool   isBuy = (signal == "BUY");
   color  clr   = (model == "ADVANCED") ? InpAdvancedColor : InpClassicColor;
   string label = "[" + model + " MODEL] " + signal + " " + prob + "% #" + ticket;

   // Arrow
   string arrow = base + "_arrow";
   if(ObjectFind(0, arrow) < 0)
     {
      ObjectCreate(0, arrow, isBuy ? OBJ_ARROW_BUY : OBJ_ARROW_SELL, 0, t, price);
      ObjectSetInteger(0, arrow, OBJPROP_COLOR, clr);
      ObjectSetInteger(0, arrow, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, arrow, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, arrow, OBJPROP_TOOLTIP, label);
     }

   // Model text tag (below the arrow for BUY, above for SELL)
   string txt = base + "_txt";
   if(ObjectFind(0, txt) < 0)
     {
      ObjectCreate(0, txt, OBJ_TEXT, 0, t, price);
      ObjectSetString(0, txt, OBJPROP_TEXT, "  " + label);
      ObjectSetString(0, txt, OBJPROP_FONT, "Arial Bold");
      ObjectSetInteger(0, txt, OBJPROP_FONTSIZE, InpFontSize);
      ObjectSetInteger(0, txt, OBJPROP_COLOR, clr);
      ObjectSetInteger(0, txt, OBJPROP_ANCHOR, isBuy ? ANCHOR_LEFT_UPPER : ANCHOR_LEFT_LOWER);
      ObjectSetInteger(0, txt, OBJPROP_SELECTABLE, false);
     }

   if(!InpDrawSLTP)
      return;

   int      periodSec = PeriodSeconds();
   datetime t2        = t + periodSec * 10;
   DrawDash(base + "_sl", t, t2, sl, clrRed);
   DrawDash(base + "_tp", t, t2, tp, clrLime);
  }

//+------------------------------------------------------------------+
void DrawDash(const string name, const datetime t1, const datetime t2, const double level, const color clr)
  {
   if(level <= 0 || ObjectFind(0, name) >= 0)
      return;
   ObjectCreate(0, name, OBJ_TREND, 0, t1, level, t2, level);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_DOT);
   ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
  }
//+------------------------------------------------------------------+
