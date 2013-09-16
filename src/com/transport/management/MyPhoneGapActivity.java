/**
 * @author Isuru Wijesinghe
 *Email: isurusuranga.wijesinghe@gmail.com
 */

package com.transport.management;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

@SuppressLint("SetJavaScriptEnabled")
public class MyPhoneGapActivity extends Activity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		WebView mainWebView = (WebView) findViewById(R.id.mainWebView);

		WebSettings webSettings = mainWebView.getSettings();
		/*
		 * I am using JQuery Mobile in the page, I need to enable java scripts
		 * in the webView
		 */
		webSettings.setJavaScriptEnabled(true);
		// The scroll bar is rendered inside the page.
		mainWebView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
		/*
		 * when click a link, it loads in the phone browser and not inside the
		 * application. To “fix” this, I need to create a webViewClient, and set
		 * it as the mainWebView’s webViewClient:
		 */
		mainWebView.setWebViewClient(new MyCustomWebViewClient());
		mainWebView.loadUrl("file:///android_asset/www/index.html");

	}

	private class MyCustomWebViewClient extends WebViewClient {
		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			view.loadUrl(url);
			return true;
		}
	}
}