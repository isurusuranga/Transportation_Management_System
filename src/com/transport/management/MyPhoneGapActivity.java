package com.transport.management;

import org.apache.cordova.DroidGap;
import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;

@SuppressLint("SetJavaScriptEnabled")
public class MyPhoneGapActivity extends DroidGap {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		final WebView webview = new WebView(this);
		webview.getSettings().setJavaScriptEnabled(true);
		webview.loadUrl("file:///android_asset/www/index.html");

		webview.setWebViewClient(new WebViewClient() {
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				// view.loadUrl(url);
				return false;
			}

			@Override
			public void onPageFinished(WebView view, String url) {
				super.onPageFinished(view, url);
				setContentView(webview);

			}
		});

		// super.setIntegerProperty("loadUrlTimeoutValue", 60000);
		// super.loadUrl("file:///android_asset/www/index.html");

	}
}
