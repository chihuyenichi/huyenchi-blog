

#include <bits/stdc++.h>
using namespace std;

using ll = long long;
using ull = unsigned long long;

vector<ll> fib;
vector<ull> dep;
map<int, pair<ull, ull>> basis;

int minCoins(ll Q) {
    int c = 0;
    int i = (int)fib.size() - 1;
    while (Q > 0) {
        while (i > 0 && fib[i] > Q) i--;
        Q -= fib[i];
        c++;
    }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    const ll LIM = 1000000000000LL;
    ll a = 1, b = 2;
    while (a <= LIM) {
        fib.push_back(a);
        ll t = a + b;
        a = b;
        b = t;
    }

    for (int i = 0; i < (int)fib.size(); i++) {
        ull x = (ull)fib[i], m = 1ULL << i;
        while (x) {
            int hb = 63 - __builtin_clzll(x);
            auto it = basis.find(hb);
            if (it != basis.end()) {
                x ^= it->second.first;
                m ^= it->second.second;
            } else {
                basis[hb] = {x, m};
                break;
            }
        }
        if (x == 0) dep.push_back(m);
    }

    int T;
    cin >> T;
    while (T--) {
        ll m, nX;
        cin >> m >> nX;

        ull x = (ull)nX, part = 0;
        bool ok = true;
        while (x) {
            int hb = 63 - __builtin_clzll(x);
            auto it = basis.find(hb);
            if (it == basis.end()) {
                ok = false;
                break;
            }
            x ^= it->second.first;
            part ^= it->second.second;
        }
        if (!ok) {
            cout << -1 << endl;
            continue;
        }

        int D = (int)dep.size();
        int best = INT_MAX;
        for (int combo = 0; combo < (1 << D); combo++) {
            ull sm = part;
            for (int t = 0; t < D; t++) {
                if ((combo >> t) & 1) sm ^= dep[t];
            }

            ll s = 0;
            int cnt = __builtin_popcountll(sm);
            for (ull t = sm; t; t &= t - 1) {
                s += fib[__builtin_ctzll(t)];
            }

            if (s > m) continue;
            ll rest = m - s;
            if (rest & 1) continue;

            best = min(best, cnt + 2 * minCoins(rest / 2));
        }

        cout << (best == INT_MAX ? -1 : best) << endl;
    }

    return 0;
}
