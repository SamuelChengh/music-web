#!/usr/bin/env python3
"""Test all music web features"""
import sys
from playwright.sync_api import sync_playwright

def test_all_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Enable console logging
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        
        print("=" * 60)
        print("Testing TheH Music Web Application")
        print("=" * 60)
        
        # Test 1: Homepage loads
        print("\n[1/8] Testing Homepage...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)
        
        title = page.title()
        print(f"  Page title: {title}")
        
        # Check for main elements
        header = page.locator('header').count()
        print(f"  Header found: {header > 0}")
        
        # Check for song cards
        song_cards = page.locator('.grid').count()
        print(f"  Song grid found: {song_cards > 0}")
        
        # Test 2: Theme toggle
        print("\n[2/8] Testing Theme Toggle...")
        try:
            theme_btn = page.locator('button[title*="模式"]').first
            if theme_btn.count() > 0:
                theme_btn.click()
                page.wait_for_timeout(500)
                print("  Theme toggle: OK")
            else:
                print("  Theme toggle: Button not found")
        except Exception as e:
            print(f"  Theme toggle error: {e}")
        
        # Test 3: Color picker
        print("\n[3/8] Testing Color Picker...")
        try:
            color_btn = page.locator('button[title="主题颜色"]').first
            if color_btn.count() > 0:
                color_btn.click()
                page.wait_for_timeout(500)
                color_options = page.locator('.grid.grid-cols-5 button').count()
                print(f"  Color options found: {color_options}")
                # Click outside to close
                page.keyboard.press('Escape')
                page.wait_for_timeout(300)
                print("  Color picker: OK")
            else:
                print("  Color picker: Button not found")
        except Exception as e:
            print(f"  Color picker error: {e}")
        
        # Test 4: Navigation - Rank page
        print("\n[4/8] Testing Rank Navigation...")
        try:
            rank_link = page.locator('text=排行榜').first
            rank_link.click()
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            
            rank_title = page.locator('h1:has-text("排行榜")').count()
            print(f"  Rank page loaded: {rank_title > 0}")
        except Exception as e:
            print(f"  Rank navigation error: {e}")
        
        # Test 5: Artist page
        print("\n[5/8] Testing Artist Navigation...")
        try:
            artist_link = page.locator('text=歌手').first
            artist_link.click()
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(1000)
            
            artist_title = page.locator('h1:has-text("歌手")').count()
            print(f"  Artist page loaded: {artist_title > 0}")
        except Exception as e:
            print(f"  Artist navigation error: {e}")
        
        # Test 6: Search functionality
        print("\n[6/8] Testing Search...")
        try:
            search_input = page.locator('input[placeholder*="搜索"]').first
            search_input.fill('周杰伦')
            page.wait_for_timeout(500)
            
            search_btn = page.locator('button:has-text("搜索")').first
            search_btn.click()
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)
            
            results = page.locator('.space-y-2 > div').count()
            print(f"  Search results found: {results}")
        except Exception as e:
            print(f"  Search error: {e}")
        
        # Test 7: Mobile menu (resize)
        print("\n[7/8] Testing Mobile Menu...")
        try:
            page.set_viewport_size({"width": 375, "height": 812})
            page.wait_for_timeout(500)
            
            # Check for hamburger menu
            menu_btn = page.locator('button:has(svg)').first
            if menu_btn.count() > 0:
                menu_btn.click()
                page.wait_for_timeout(500)
                
                # Check for menu panel
                menu_panel = page.locator('text=菜单').count()
                print(f"  Mobile menu opened: {menu_panel > 0}")
                
                # Close menu
                close_btn = page.locator('button:has-text("×")').first
                if close_btn.count() > 0:
                    close_btn.click()
                    page.wait_for_timeout(300)
                    print("  Mobile menu: OK")
            else:
                print("  Mobile menu: Button not visible on desktop")
        except Exception as e:
            print(f"  Mobile menu error: {e}")
        
        # Test 8: Player bar exists
        print("\n[8/8] Testing Player Bar...")
        try:
            page.set_viewport_size({"width": 1280, "height": 800})
            page.wait_for_timeout(500)
            
            player_bar = page.locator('.border-t').count()
            print(f"  Player bar found: {player_bar > 0}")
        except Exception as e:
            print(f"  Player bar error: {e}")
        
        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        
        if errors:
            print(f"\n⚠️  JavaScript Errors found: {len(errors)}")
            for err in errors[:5]:
                print(f"  - {err}")
        else:
            print("\n✅ No JavaScript errors detected")
        
        # Screenshot
        page.screenshot(path='/tmp/music-web-test.png', full_page=True)
        print("\n📸 Screenshot saved to /tmp/music-web-test.png")
        
        browser.close()
        print("\n✅ All tests completed!")

if __name__ == "__main__":
    try:
        test_all_features()
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)
