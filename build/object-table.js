/**
 * object-table - angular smart table directive
 * @version v0.2.2
 * @author Yauheni Kokatau
 * @license MIT
 */
"use strict";angular.module("objectTable",[]).directive("contenteditable",function(){return{restrict:"A",require:["ngModel","^objectTable"],link:function(e,t,r,n){var a=n[0],o=n[1];a.$render=function(){t.html(null==a.$viewValue?"":a.$viewValue)},t.bind("change blur",function(){var n=null==a.$viewValue?"":a.$viewValue.toString(),i=t.text(),l=r.header;n!==i&&(e.$apply(function(){a.$setViewValue(i)}),o.onEdit&&"function"==typeof o.onEdit&&o.onEdit({$oldValue:n,$newValue:i,$cellName:l}))})}}}),angular.module("objectTable").directive("objectTable",["$compile","$interpolate",function(e,t){return{restrict:"A",replace:!0,templateUrl:"/src/templates/common.html",controller:"objectTableCtrl",controllerAs:"ctrl",transclude:!0,scope:{data:"=",display:"=?",resize:"=?",paging:"=?",pagesToShow:"=?",fromUrl:"@",sortingType:"@?sorting",editable:"&?",select:"@?",selectedModel:"=?",dragColumns:"=?",onEdit:"&?",onDrag:"&?"},compile:function(e,t){var r="",n="";return t.addFilter&&(r+=t.addFilter),"false"!==t.sorting&&(r+="| orderBy:sortingArray"),t.dragColumns&&e.find("th").attr("allow-drag",""),"separate"===t.search?t.fields.split(",").forEach(function(e,t){r+="| filter:{'"+e.trim()+"':columnSearch['"+e+"']}"}):"undefined"!=typeof t.search&&"true"!==t.search||(r+="| filter:globalSearch"),n+=" | offset: currentPage:display |limitTo: display",e[0].querySelector("#rowTr").setAttribute("ng-repeat","item in $parent.$filtered = (data"+r+")"+n),e.find("paging").attr("count","$filtered.length"),function(e,t,a,o,i){o._init(),i(e,function(t,a){e.$owner=a.$parent;for(var i in t)if(t.hasOwnProperty(i))switch(t[i].tagName){case"THEAD":o._addHeaderPattern(t[i]);break;case"TBODY":e.findBody=!0,o._addRowPattern(t[i],r,n);break;case"TFOOT":o._addFooterPattern(t[i])}})}}}}]),angular.module("objectTable").directive("allowDrag",function(){return{restrict:"A",controller:function(){},compile:function(e,t){function r(e,t){var r=e[0].parentNode.querySelector("."+t);r&&r.classList.remove(t)}return function(e,t,n,a){t.attr("draggable",!0),t.bind("dragstart",function(e){a.target=this,this.classList.add("dragged");var t=e.originalEvent||e;t.dataTransfer.setData("text",a.target.cellIndex)}),t.bind("dragover",function(e){e.preventDefault()}),t.bind("dragenter",function(e){a.toTarget=this,this.classList.contains("draggedOver")||this.classList.contains("dragged")||this.classList.add("draggedOver"),e.preventDefault(),e.stopPropagation()}),t.bind("dragend",function(e){this.classList.contains("dragged")&&this.classList.remove("dragged"),e.preventDefault()}),t.bind("dragleave",function(e){this.classList.remove("draggedOver")}),t.bind("drop",function(e){var n=a.toTarget.cellIndex,o=e.originalEvent||e,i=parseInt(o.dataTransfer.getData("text"),10);r(t,"dragged"),r(t,"draggedOver"),t.parent().controller("objectTable").changeColumnsOrder(n,i),e.preventDefault()})}}}}),angular.module("objectTable").controller("objectTableCtrl",["$scope","$timeout","$element","$attrs","$http","$compile","$controller","objectTableUtilService",function(e,t,r,n,a,o,i,l){i("objectTableSortingCtrl",{$scope:e});var s=this;this._init=function(){e.headers=[],e.fields=[],e.display=e.display||5,e.paging=!angular.isDefined(e.paging)||e.paging,e.pagesToShow=angular.isDefined(e.pagesToShow)?e.pagesToShow:5,e.sortingType=e.sortingType||"simple",e.currentPage=0,e.customHeader=!1,"separate"==n.search?(e.search="separate",e.columnSearch=[]):e.search="undefined"==typeof n.search||"true"===n.search,e.headers=l.getArrayFromParams(n.headers,"headers"),e.fields=l.getArrayFromParams(n.fields,"fields"),n.fromUrl&&this._loadExternalData(n.fromUrl),e.onEdit&&(this.onEdit=e.onEdit),e.selectedModel="multiply"===e.select?[]:{}},this.onEdit=e.onEdit,this._loadExternalData=function(t){e.dataIsLoading=!0,a.get(t).then(function(t){e.data=t.data,e.dataIsLoading=!1})},this._addHeaderPattern=function(t){e.customHeader=!0,Array.prototype.forEach.call(t.querySelectorAll("[allow-drag]"),function(e,t){e.setAttribute("index",t)}),t.removeAttribute("ng-non-bindable"),r.find("table").prepend(t)},this._addFooterPattern=function(e){r.find("table").prepend(e)},this._addRowPattern=function(t,n,a){this._checkEditableContent(t),this._addRepeatToRow(t,n,a),t.removeAttribute("ng-non-bindable"),r.find("table").append(t.outerHTML),this.bodyTemplate=t.innerHTML,o(r.find("tbody"))(e)},this._addRepeatToRow=function(e,t,r){var n=angular.element(e).find("tr");n.attr("ng-repeat","item in $filtered = (data"+t+")"+r),n.attr("ng-click")||n.attr("ng-click","setSelected(item)"),n.attr("ng-class","{'selected-row':ifSelected(item)}")},this._checkEditableContent=function(e){var t,r=/\{\{:*:*(.*?)\}\}/g;Array.prototype.forEach.call(e.querySelectorAll("[editable]"),function(e){t=e.innerHTML.replace(r,"$1"),e.innerHTML="<div contentEditable ng-model='"+t+"'>{{"+t+"}}</div>"})},this.setCurrentPage=function(t){e.currentPage=t},e.setSelected=function(t){"multiply"===e.select?s._containsInSelectArray(t)?e.selectedModel.splice(e.selectedModel.indexOf(t),1):e.selectedModel.push(t):e.selectedModel=t},this._containsInSelectArray=function(t){if(e.selectedModel.length)return e.selectedModel.filter(function(e){return angular.equals(e,t)}).length>0},e.ifSelected=function(t){return e.selectedModel&&"multiply"===e.select?s._containsInSelectArray(t):t.$$hashKey==e.selectedModel.$$hashKey},this.changeColumnsOrder=function(t,n){e.$apply(function(){e.fields.swap(t,n);var a=e.headers.slice();if(e.headers.swap(t,n),e.onDrag&&"function"==typeof e.onDrag&&e.onDrag({$oldOrder:a,$newOrder:e.headers}),a=null,e.columnSearch&&e.columnSearch.swap(t,n),s.bodyTemplate){var i=angular.element(s.bodyTemplate).children(),l=document.createElement("tr"),d=document.createElement("tbody"),c=r.find("tbody").find("tr")[0].attributes;Array.prototype.swap.apply(i,[t,n]),[].forEach.call(c,function(e,t){l.setAttribute(e.name,e.value)});for(var u=0,g=i.length;u<g;u++)l.appendChild(i[u]);d.appendChild(l),r.find("tbody").replaceWith(d),s.bodyTemplate=d.innerHTML,o(r.find("tbody"))(e)}if(e.customHeader){var p=r.find("th"),l=document.createElement("tr"),f=document.createElement("thead");Array.prototype.swap.apply(p,[t,n]);for(var u=0,g=p.length;u<g;u++)l.appendChild(p[u]);f.appendChild(l),r.find("thead").replaceWith(f)}s.pageCtrl&&s.pageCtrl.setPage(0)})},e.setCurrentPageForPageCtrl=function(e){s.pageCtrl&&s.pageCtrl.setPage(e)}}]),angular.module("objectTable").filter("offset",function(){return function(e,t,r){if(e){t=parseInt(t,10),r=parseInt(r,10);var n=t*r;return e.slice(n,n+r)}}}),angular.module("objectTable").controller("pagingTableCtrl",["$scope","$element","$attrs",function(e,t,r){e.currentPage=0,e.prevPage=function(){e.currentPage>0&&e.currentPage--,e.setCurrentPageToTable()},e.nextPage=function(){e.currentPage<e.pageCount()&&e.currentPage++,e.setCurrentPageToTable()},e.setCurrentPageToTable=function(){e.objectTableCtrl.setCurrentPage(e.currentPage)},e.prevPageDisabled=function(){return 0===e.currentPage?"disabled":""},e.pageCount=function(){return e.count>0?Math.ceil(e.count/e.display)-1:0},e.nextPageDisabled=function(){return e.currentPage===e.pageCount()?"disabled":""},e.setPage=function(t){e.currentPage=t,e.setCurrentPageToTable()},e.range=function(){var t=e.pageCount()+1<e.pagesToShow?e.pageCount()+1:e.pagesToShow,r=[],n=e.currentPage;n>e.pageCount()-t&&(n=e.pageCount()-t+1);for(var a=n;a<n+t;a++)r.push(a);return r}}]),angular.module("objectTable").controller("objectTableSortingCtrl",["$scope",function(e){function t(e){o&&(r.width=a+(e.pageX-n))}e.sort={fields:[],reverse:[]},e.sortingArray=[],e.sortBy=function(t){if(i)return void(i=!1);if(e.data.length){var r=e.headers[e.fields.indexOf(t)];"compound"==e.sortingType?e.sort.fields.indexOf(r)==-1?(e.sort.fields.push(r),e.sortingArray.push(t),e.sort.reverse.push(!1)):e.changeReversing(t,e.sort.fields.indexOf(r)):"simple"==e.sortingType&&(e.sort.fields=[r],e.changeReversing(t))}},e.changeReversing=function(t,r){"compound"==e.sortingType?(e.sort.reverse[r]=!e.sort.reverse[r],e.sortingArray[r]=e.sort.reverse[r]?"-"+t:t):"simple"==e.sortingType&&(e.sort.reverse[0]=!e.sort.reverse[0],e.sortingArray=e.sort.reverse[0]?[t]:["-"+t])},e.headerIsSortedClass=function(t){if(e.sortingArray.length)if("simple"==e.sortingType){if(t==e.sort.fields[0]||"-"+t==e.sort.fields[0])return e.sort.reverse[0]?"table-sort-down":"table-sort-up"}else if("compound"==e.sortingType){var r=e.sort.fields.indexOf(t);if(r!=-1)return e.sort.reverse[r]?"table-sort-down":"table-sort-up"}},e.removeSorting=function(){var t=e.sort.fields.indexOf(this.sortField);t>-1&&(e.sort.fields.splice(t,1),e.sort.reverse.splice(t,1),e.sortingArray.splice(t,1)),t=null};var r,n,a,o=!1,i=!1;e.resizeStart=function(e){var i=e.target?e.target:e.srcElement;i.classList.contains("resize")&&(r=i.parentNode,o=!0,n=e.pageX,a=i.parentNode.offsetWidth,document.addEventListener("mousemove",t),e.stopPropagation(),e.preventDefault())},e.resizeEnd=function(e){o&&(document.removeEventListener("mousemove",t),e.stopPropagation(),e.preventDefault(),o=!1,i=!0)}}]),angular.module("objectTable").service("objectTableUtilService",[function(){return Array.prototype.swap=function(e,t){if(e>=this.length)for(var r=e-this.length;r--+1;)this.push(void 0);return this.splice(e,0,this.splice(t,1)[0]),this},{getArrayFromParams:function(e,t){if(!e)throw"Required '"+t+"' attribute is not found!";for(var r=[],n=e.split(","),a=0,o=n.length;a<o;a++)r.push(n[a].trim());return r}}}]),angular.module("objectTable").directive("paging",["$compile","$interpolate",function(e,t){return{restrict:"E",replace:!0,templateUrl:"/src/templates/paging.html",controller:"pagingTableCtrl",require:"^objectTable",scope:{count:"=",display:"=",pagesToShow:"="},link:function(e,t,r,n){e.objectTableCtrl=n,e.objectTableCtrl.pageCtrl=e}}}]);
angular.module("objectTable").run(["$templateCache", function($templateCache) {$templateCache.put("/src/templates/common.html","<div class=\"object-table-module\"><div class=\"col-xs-12 col-sm-6 col-md-8 sorting-container\"><div ng-if=\"sortingType && sort.fields.length\">Sorting:<div ng-repeat=\"sortField in sort.fields\" class=\"sorting-badge\"><span class=\"glyphicon\" ng-class=\"{\'glyphicon-chevron-down\':sort.reverse[$index], \'glyphicon-chevron-up\':!sort.reverse[$index]}\"></span> {{::sortField}} <span class=\"glyphicon glyphicon-remove close\" ng-click=\"removeSorting()\"></span></div></div></div><div class=\"form-group col-xs-12 col-sm-6 col-md-4\" ng-if=\"search && \'separate\'!=search\"><input type=\"text\" placeholder=\"Search\" ng-model=\"$parent.globalSearch\" class=\"row pull-right form-control search\" ng-model-options=\"{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }\" ng-change=\"setCurrentPageForPageCtrl(0)\"> <i class=\"glyphicon glyphicon-search search_icon\"></i></div><div class=\"clearfix\"></div><div class=\"back-cover\"><table class=\"table table-responsive table-bordered object-table\" ng-mousedown=\"resizeStart($event)\" ng-mouseup=\"resizeEnd($event)\"><thead ng-if=\"!customHeader\"><tr><th ng-repeat=\"head in headers track by $index\" ng-click=\"sortBy(fields[$index])\" ng-class=\"headerIsSortedClass(head)\" class=\"sortable\">{{head}}<div ng-if=\"resize\" class=\"resize\"></div></th></tr></thead><thead ng-if=\"!customHeader&& \'separate\'===search\"><tr><th ng-repeat=\"head in headers track by $index\" class=\"separate\"><i class=\"glyphicon glyphicon-search search_icon separate\"></i> <input type=\"text\" ng-model=\"columnSearch[fields[$index]]\" placeholder=\"{{head}}...\" class=\"form-control search separate\" ng-model-options=\"{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }\" ng-change=\"setCurrentPageForPageCtrl(0)\"></th></tr></thead><tbody ng-if=\"!findBody\"><tr id=\"rowTr\" ng-click=\"setSelected(item)\" ng-class=\"{\'selected-row\':ifSelected(item)}\"><!-- <= will inject ng-repeat --><!-- params: headers and fields --><td ng-if=\"!editable\" ng-repeat=\"field in fields\">{{item[field]}}</td><td ng-if=\"editable\" editable ng-repeat=\"field in fields\"><div contenteditable ng-model=\"item[field]\" header=\"{{field}}\">{{item[field]}}</div></td></tr></tbody></table></div><div class=\"loading\" ng-show=\"dataIsLoading\"><span class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></span> Loading Data...</div><paging pages-to-show=\"pagesToShow\" ng-if=\"paging\" data-display=\"display\" count=\"$filtered.length\" class=\"object-table-paging\" ng-hide=\"dataIsLoading\"></paging><div class=\"clearfix\"></div></div>");
$templateCache.put("/src/templates/paging.html","<div><div class=\"col-xs-9\"><nav ng-hide=\"pageCount()==0\"><ul class=\"pagination\"><li ng-class=\"prevPageDisabled()\"><a href ng-click=\"prevPage()\">« Prev</a></li><li ng-repeat=\"n in range()\" ng-class=\"{active: n == currentPage}\" ng-click=\"setPage(n)\"><a href=\"javascript:void(0)\">{{::n+1}}</a></li><li ng-class=\"nextPageDisabled()\"><a href ng-click=\"nextPage()\">Next »</a></li></ul></nav></div><div class=\"col-xs-3\"><span class=\"label label-default count\">{{count}} <span class=\"records\">records</span></span></div></div>");}]);