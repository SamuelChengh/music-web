#!/usr/bin/env python3
"""Simple test - just check if page loads"""
import sys
from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Opening homepage...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('domcontentloaded')
        page.wait_for_timeout(3000)
        
        # Screenshot
        page.screenshot(path='/tmp/music-web-test.png')
        print("Screenshot saved!")
        
        # Check title
        print(f"Title: {page.title()}")
        
        # Check for errors in console
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        
        browser.close()
        
        if errors:
            print(f"Errors: {errors}")
        
        print("Done!")

if __name__ == "__main__":
    main()
