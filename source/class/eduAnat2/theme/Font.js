/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("eduAnat2.theme.Font",
{
  extend : qx.theme.indigo.Font,

  fonts :
  {
    "default" :
    {
      size : 13,
      lineHeight : 1.4,
      family : ["Tahoma", "Liberation Sans", "Arial", "sans-serif"],
      sources:
      [
        {
          family : "FiraSans-Regular",
          source:
          [
            "resource/ife/fira-sans/FiraSans-Regular.woff2",
            //"resource/ife/fira-sans/FiraSans-ExtraLightItalic.woff2"
          ]
        }
      ]
    }
  }
});
