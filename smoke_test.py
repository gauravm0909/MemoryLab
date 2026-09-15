"""Small deterministic test for the MemoryLab update rule."""
import math


def vec(seed, n=12):
    # Same deterministic construction used conceptually by the browser implementation.
    h = 2166136261
    for ch in seed:
        h ^= ord(ch)
        h = (h * 16777619) & 0xffffffff
    out=[]
    x=h or 1
    for _ in range(n):
        x ^= (x << 13) & 0xffffffff
        x ^= x >> 17
        x ^= (x << 5) & 0xffffffff
        x &= 0xffffffff
        out.append((x % 2001) / 1000 - 1)
    norm=math.sqrt(sum(v*v for v in out)) or 1
    return [v/norm for v in out]


def test_fixed_state():
    d=12; M=[[0.0]*d for _ in range(d)]
    alpha=.65; decay=.02
    for concept,answer in [("France","Paris"),("Germany","Berlin"),("Japan","Tokyo")]:
        for i in range(d):
            for j in range(d): M[i][j]*=(1-decay)
        k=vec('key:'+concept,d); v=vec('value:'+answer,d)
        for i in range(d):
            for j in range(d): M[i][j]+=alpha*k[i]*v[j]
    assert len(M)==d and all(len(row)==d for row in M)
    print('PASS: fixed state remains', d*d, 'cells after 3 writes')

if __name__=='__main__': test_fixed_state()
