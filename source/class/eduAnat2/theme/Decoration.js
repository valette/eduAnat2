/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("eduAnat2.theme.Decoration",
{
  extend : qx.theme.indigo.Decoration,

  decorations :
  {
		"button-box" :
		{
		  decorator : [
			qx.ui.decoration.MSingleBorder,
			qx.ui.decoration.MBorderRadius,
			qx.ui.decoration.MBackgroundColor
		  ],

		  style :
		  {
			radius: 6,
			color: "#6c757d",
			backgroundColor:"white",
			width: 1
		  }
		},
		"window" :
		{
		  decorator : [
			qx.ui.decoration.MSingleBorder,
			qx.ui.decoration.MBorderRadius,
			qx.ui.decoration.MBackgroundColor
		  ],

		  style :
		  {
			radius: 6,
			color: "#6c757d",
			backgroundColor:"white",
			width: 1
		  }
		},
		"button-box-pressed" :
		{
		  include : "button-box",
		  style :
		  {
			  radius: 6,
			  backgroundColor:"#DDDDDD",
			  width: 1
		  }
		},
		"button-box-hovered" :
		{
		  include : "button-box",
		  style :
		  {
			  color: "black"
		  }
		}
  }
});
