"use strict";

var IndexPage = React.createClass({
    displayName: "IndexPage",
    propTypes: {
        manifest: React.PropTypes.string },

    render: function () {
        // Baidu tracking
        // var BAIDU_SCRIPT = `
        // var _hmt = _hmt || [];
        // (function() {
        //   var hm = document.createElement("script");
        //   hm.async=!0;
        //   hm.src = "//hm.baidu.com/hm.js?5742ffd7a27a3bc653de085cae4c0ce0";
        //   var s = document.getElementsByTagName("script")[0];
        //   s.parentNode.insertBefore(hm, s);
        // })();`


        // Mixpanel tracking:
        var MIXPANEL_SCRIPT = "(function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(\".\");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;\"undefined\"!==typeof d?c=b[d]=[]:d=\"mixpanel\";c.people=c.people||[];c.toString=function(b){var a=\"mixpanel\";\"mixpanel\"!==d&&(a+=\".\"+d);b||(a+=\" (stub)\");return a};c.people.toString=function(){return c.toString(1)+\".people (stub)\"};i=\"disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user\".split(\" \"); for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=e.createElement(\"script\");a.type=\"text/javascript\";a.async=!0;a.src=\"undefined\"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:\"file:\"===e.location.protocol&&\"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js\".match(/^\\/\\//)?\"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js\":\"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js\";f=e.getElementsByTagName(\"script\")[0];f.parentNode.insertBefore(a,f)}})(document,window.mixpanel||[]); mixpanel.init(\"76a53e8c78c380923215022ce3fb18c8\");";


        var assetI18nSubdir = "";
        if (I18n.countryCode != "us") {
            assetI18nSubdir = I18n.countryCode + "/";
        }

        return React.createElement(
            "html",
            { manifest: this.props.manifest },
            React.createElement(
                "head",
                null,
                React.createElement("meta", { charSet: "UTF-8" }),
                React.createElement("link", { href: "build/yttro.css", rel: "stylesheet" }),
                React.createElement("meta", { name: "viewport", content: "width=device-width, user-scalable=0, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no" }),
                React.createElement("meta", { httpEquiv: "X-UA-Compatible", content: "IE=edge" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "58x58", href: "assets/" + assetI18nSubdir + "app-icons/58.png" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "80x80", href: "assets/" + assetI18nSubdir + "app-icons/80.png" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "87x87", href: "assets/" + assetI18nSubdir + "app-icons/87.png" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "116x116", href: "assets/" + assetI18nSubdir + "app-icons/116.png" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "120x120", href: "assets/" + assetI18nSubdir + "app-icons/120.png" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "180x180", href: "assets/" + assetI18nSubdir + "app-icons/180.png" }),
                React.createElement("link", { rel: "apple-touch-icon", sizes: "1024x1024", href: "assets/" + assetI18nSubdir + "app-icons/1024.png" }),
                React.createElement("link", { rel: "icon", href: "data:null" }),
                React.createElement(
                    "title",
                    { translate: "yes" },
                    "YTTRO - A World of Games"
                )
            ),
            React.createElement(
                "body",
                { id: "body" },
                React.createElement("div", { id: "splash", className: "focus" }),
                React.createElement("canvas", { id: "YMap" })
            ),
            React.createElement("script", { type: "text/javascript", dangerouslySetInnerHTML: { __html: MIXPANEL_SCRIPT } }),
            React.createElement("script", { src: "build/yttro.js", async: "async" })
        );
    }
});

module.exports = IndexPage;
