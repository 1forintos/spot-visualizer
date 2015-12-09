#!/usr/bin/env python
from bottle import run, post, request, get
import spot

@post('/spotvis')
def get_automaton():
    input = request.forms.get('query')
    spot.setup()
    f = spot.formula(input)
    a = f.translate('tgba')
    output = a.to_str('dot')
    return output

@get('/test')
def test():
    input = '(Ga -> Gb) W c'
    spot.setup()
    f = spot.formula(input)
    a = f.translate('tgba')
    output = a.to_str('dot')
    return output




run(host='localhost', port=8080, debug=True)
