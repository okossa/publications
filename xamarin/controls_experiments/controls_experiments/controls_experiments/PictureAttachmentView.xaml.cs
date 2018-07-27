using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace controls_experiments
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class PictureAttachmentView : ContentView
	{

        public static readonly BindableProperty TextProperty = BindableProperty.Create(
               nameof(Text),
               typeof(string),
               typeof(PictureAttachmentView),
               string.Empty,
               propertyChanging: (bindable, oldValue, newValue) =>
               {
                   var control = bindable as PictureAttachmentView;
                   var changingFrom = oldValue as string;
                   var changingTo = newValue as string;
                   control.fileNameLabel.SetValue(Label.TextProperty, newValue);
               });

        public string Text { get; set; }
 
        public PictureAttachmentView ()
		{
			InitializeComponent ();
        }

        //delete the attachment
        public void onDeleteAttachment()
        {
            IsVisible = false;
            //header.BackgroundColor = Color.Red;
        }
	}
}