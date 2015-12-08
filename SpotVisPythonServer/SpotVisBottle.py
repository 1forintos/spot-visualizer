#!/usr/bin/env python
from bottle import run, post, request
import spot

@post('/spotvis')
def get_automaton():
    output = spot.formula(request.forms.get('query')).translate('BA').to_str('spin')
    return output

run(host='localhost', port=8080, debug=True)
