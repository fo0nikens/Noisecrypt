package com.example.charmeapp;

import android.os.Bundle;
import android.app.Activity;
import android.view.Menu;

public class ActivityLogin extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_activity_login);
    }
    public void tryLogin(String username, String password, String passphrase)
    {
    	
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.activity_login, menu);
        return true;
    }
    
}