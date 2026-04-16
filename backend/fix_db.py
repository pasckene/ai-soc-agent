import sqlite3

def fix_schema():
    conn = sqlite3.connect('soc_copilot.db')
    cursor = conn.cursor()
    
    # Get current columns
    cursor.execute('PRAGMA table_info(users)')
    columns = [row[1] for row in cursor.fetchall()]
    
    changed = False
    
    if 'first_name' not in columns:
        print("Adding first_name to users table")
        cursor.execute('ALTER TABLE users ADD COLUMN first_name VARCHAR')
        changed = True
        
    if 'last_name' not in columns:
        print("Adding last_name to users table")
        cursor.execute('ALTER TABLE users ADD COLUMN last_name VARCHAR')
        changed = True
        
    if changed:
        conn.commit()
        print("Schema update complete")
    else:
        print("Schema already matches model")
        
    conn.close()

if __name__ == "__main__":
    fix_schema()
