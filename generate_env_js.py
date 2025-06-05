import os

def parse_env():
    env = {}
    if not os.path.exists('.env'):
        print('.env file not found!')
        return env
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k.strip()] = v.strip()
    return env

env = parse_env()
supabase_url = env.get('SUPABASE_URL', '')
supabase_key = env.get('SUPABASE_KEY', '')

with open('static/env.js', 'w', encoding='utf-8') as f:
    f.write(f'window.SUPABASE_URL = "{supabase_url}";\n')
    f.write(f'window.SUPABASE_KEY = "{supabase_key}";\n')
print('static/env.js generated from .env')
