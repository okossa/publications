
/*
* Author : Okossa Douniama
* Contact: okossa.douniama@gmail.com
* Date   : 2014/08/29
*/
define(function (require, exports, module) {    
    "use strict";
    
    SimpleTooltip.prototype.options = {
        defaultTop : 50,
        defaultLeft : -140
    };
    
    window.val = true;
    
    function SimpleTooltip(options){     
            $.extend(this.options,options);
        
            if(this.options.chart){    
                var ref = this;              
                
//              ref.options = this.options;   //don't work
                ref.options = $.extend(true,{},this.options);    //work   
                
                this.options.chart.renderlet(_createTooltip.bind(ref));
            }
            else{
                throw "No chart has been specified. A chart is required";
            }
    }
    
    function getNewThis(oldThis){
        return oldThis;
    }
    

    function _createTooltip() {            
        var selection = _selectEntity.call(this);
        $.each(selection,function(index,value){             
            
            var divTooltip;    
            if(this.options.CustomTooltip){
                divTooltip = this.options.CustomTooltip;
            }
            else{
                divTooltip = _buildTooltip();
            }
                        
            $('body').append(divTooltip);
         
            $(value).on('mouseover', 
                        { currentNode : value, tooltip : divTooltip },
                        function(event) {
                var currentTooltip = event.data.tooltip;
                var currentNode = event.data.currentNode;
                var textToDisplay = $(currentNode).data('legend');
                if(!textToDisplay){               
                    if(this.options.accessor){
                        textToDisplay  = $(currentNode)[this.options.accessor]();
                    }
                    else{
                        textToDisplay  = $(currentNode).text();
                    }
              
                    var titleNode = $(currentNode).find('title');
                    var titleText = titleNode.text();
                    $(currentNode).data('legend',titleText);
                    titleNode.empty();
                }          
                
                var left = $(currentNode).offset().left;
                var top  = $(currentNode).offset().top;

                if(this.options.left){
                    left = left + this.options.left;
                }
                else{
                    left = left + this.options.defaultLeft;
                }

                if(this.options.top){
                    top = top  + this.options.top;
                }
                else{
                    top = top + this.options.defaultTop;
                }
            
                currentTooltip.css('top',top);
                currentTooltip.css('left',left);      
                
                currentTooltip.text(textToDisplay);
                currentTooltip.show();
                
            }.bind(this)).on('mouseout',{ tooltip : divTooltip },
                             function(event){
                                event.data.tooltip.hide();               
            }.bind(this));
        }.bind(this) );    
    } 
    
    function _buildTooltip(){      
        var id = 'id_'+ Math.floor( Math.random() * 10000 );     

        
        var divTooltip = $('<div id="'+id+'"/>');             
        divTooltip.css('background-color','black');  
        divTooltip.css('color','white');  
        divTooltip.css('font-size','20px');  
        divTooltip.css('font-weight','bold');  
        divTooltip.css('z-index','9000');  
        divTooltip.css('height','100px');  
        divTooltip.css('width','300px');  
        divTooltip.css('position','absolute');  
        divTooltip.css('display','none');  
        divTooltip.css('text-align','center');  
        divTooltip.css('border-radius','25px');  
        divTooltip.css('padding-top','20px');  
        divTooltip.css('box-shadow','1px 1px 12px #555');     
        return divTooltip;
    }
    
    function _selectEntity(){
        var arr = [];
        $.merge(arr,this.options.chart.selectAll(".dot")[0]);
        $.merge(arr,this.options.chart.selectAll(".row")[0]);
        $.merge(arr,this.options.chart.selectAll(".pie-slice")[0]);
        $.merge(arr,this.options.chart.selectAll(".bar")[0]);
        return arr;
    }
    
    module.exports = SimpleTooltip;
});
  