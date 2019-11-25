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
            "resource/eduAnat2/fira-sans/FiraSans-Regular.woff2",
            //"resource/eduAnat2/fira-sans/FiraSans-ExtraLightItalic.woff2"
          ]
        }
      ]
    }
  }
});
