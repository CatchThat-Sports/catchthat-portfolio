"""Export deterministic preview plays from a locally built CatchThat engine.

Usage: python3 scripts/export-sim-preview.py /path/to/catchthat-football
Only in-memory exhibition sessions are created; the game checkout is not changed.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
binary = root / 'engine/target/debug/engine-bridge'
out = Path(__file__).resolve().parents[1] / 'content/sim'
process = subprocess.Popen([str(binary)], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                           stderr=subprocess.DEVNULL, text=True,
                           env={**os.environ, 'CTF_DEV_HOOKS': '1'})


def rpc(method, params=None):
    process.stdin.write(json.dumps({'jsonrpc': '2.0', 'id': 1, 'method': method,
                                   'params': params or {}}) + '\n')
    process.stdin.flush()
    response = json.loads(process.stdout.readline())
    if 'error' in response:
        raise RuntimeError(response['error'])
    return response['result']


def coord(p):
    return [round(p['x'], 5), round(p['y'], 3)]


def situation(state):
    return {'seconds': state['clock']['seconds_remaining'], **state['down']}


try:
    book = {play['id']: play for play in rpc('playbook.list')}
    recordings = {}
    for play_id, seed in [('mesh', 2), ('inside_zone', 7), ('flood_right', 1)]:
        game = rpc('game.start', {'seed': 7, 'home_team': 'SEA', 'away_team': 'DAL',
                                 'offense_mode': 'manual', 'defense_mode': 'manual'})
        session = {'session_id': game['session_id']}
        rpc('game.stage_scenario', {**session, 'quarter': 1, 'clock_s': 804,
                                   'possession': 'home', 'down': 2, 'distance': 6,
                                   'los': 44, 'play_seed_override': seed})
        tick = rpc('game.tick', {**session, 'offense_play_id': play_id,
                                'defense_play_id': 'cover_three', 'pre_snap_seconds': 0})
        result = tick['log_entry']['result']
        assert result['penalty'] is None and not result['turnover'], result
        frames = tick['timeline']['frames']
        first = frames[0]['players']
        labels = [p['label'] for p in first]
        roster = {side: {p['slot']: p for p in game[team]['players']}
                  for side, team in [('Offense', 'home'), ('Defense', 'away')]}
        players = [{'label': p['label'], 'side': p['side'], 'name': p['name'],
                    'weight': roster[p['side']][p['slot']]['weight_lb']} for p in first]
        packed = []
        for frame in frames:
            by_label = {p['label']: p for p in frame['players']}
            assert len(by_label) == 22 and set(by_label) == set(labels)
            packed.append({'t': frame['t_ms'], 'ball': coord(frame['ball']),
                           'carrier': frame['ball_carrier'],
                           'players': [coord(by_label[label]['pos']) +
                                       [round(by_label[label].get('facing_deg', 90), 1)]
                                       for label in labels],
                           'events': frame['events']})
        events = [event['type'] for frame in packed for event in frame['events']]
        assert ('handoff' if play_id == 'inside_zone' else 'catch') in events
        assert abs(packed[-1]['ball'][1] - result['yards']) <= .51
        diagram = book[play_id]['diagram']
        recordings[play_id.replace('_', '-')] = {
            'name': book[play_id]['name'], 'seed': seed, 'yards': result['yards'],
            'before': situation(tick['log_entry']['state_before']),
            'after': situation(tick['state_after']), 'players': players, 'frames': packed,
            'diagram': {
                'marks': [{'label': m['label'], 'pos': coord(m['start'])}
                          for m in diagram['marks'] if m['side'] == 'Offense'],
                'routes': [{'label': r['mark_label'], 'points': [coord(p) for p in r['waypoints']]}
                           for r in diagram['routes']]}}
        print(f"{play_id}: {len(packed)} frames, {result['yards']} yards, {packed[-1]['t']}ms")
    out.mkdir(parents=True, exist_ok=True)
    (out / 'plays.json').write_text(json.dumps(recordings, separators=(',', ':')) + '\n')
    (out / 'source.json').write_text(json.dumps({
        'engineBinarySha256': hashlib.sha256(binary.read_bytes()).hexdigest(),
        'checkoutRevision': subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip(),
        'gameSeed': 7, 'home': 'SEA', 'away': 'DAL', 'defense': 'cover_three',
        'precision': 'Every engine frame retained; lateral coordinates rounded to 5 decimals, yards to 3, facing to 1.'
    }, indent=2) + '\n')
finally:
    process.stdin.close()
    process.wait(timeout=10)
