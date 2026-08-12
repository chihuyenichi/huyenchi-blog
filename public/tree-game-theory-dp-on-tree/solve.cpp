#include <bits/stdc++.h>
using namespace std;

#define ll long long 
#define nmax (int) (2e5 + 2)

int n, K;
vector < int > G[nmax];

int f[nmax], g[nmax];

bool no_it[nmax];
int bestOP(int u, int p, vector < int > not_in) {
    for (int v: not_in) {
        no_it[v] = 1;
    }
    multiset < int > mx_g;
    for (int x: G[u]) {
        if (x == p || no_it[x]) continue;
        mx_g.insert(g[x]);
    }

    int res = INT_MAX;;
    for (int x: G[u]) {
        if (x == p || no_it[x]) continue;
        mx_g.erase(mx_g.find(g[x]));
        int val_mx_g = (mx_g.empty()) ? 0 : *(prev(mx_g.end()));
        res = min(res, max(f[x], 1 + val_mx_g));
        mx_g.insert(g[x]);
    }

    for (int v: not_in) {
        no_it[v] = 0;
    }

    return res;
}

void dfs(int u, int p) {
    int c_child = 0;
    for (int v: G[u]) {
        if (v == p) continue;
        c_child++;
        dfs(v, u);
    }

    if (c_child == 0) {
        f[u] = g[u] = 0;
    }
    else if (c_child == 1) {
        f[u] = 1;
        {
            int v = G[u][0];
            if (v == p) v = G[u][1];
            vector < int > tmp;
            g[u] = 1 + bestOP(v, u, tmp);
        }
    }
    else {
        f[u] = -1;
        for (int v: G[u]) {
            if (v == p) continue;
            vector < int > no_v = {v};
            int tmp = bestOP(u, p, no_v);
            if (f[u] == -1 || f[u] > tmp) {
                f[u] = 1 + tmp;
            }
        }

        {
            vector < int > no_empty;
            g[u] = 1 + bestOP(u, p, no_empty);
        }
    }

}



void huyenchi() {
    
    cin >> n >> K;

    for (int i = 1; i < n; ++i) {
        int u, v; cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    dfs(1, 0);

    cout << (f[1] <= K ? "DA" : "NE") << '\n';
}

int main(){

    int nTest = 1;
    // cin >> nTest;
    while (nTest--) {
        huyenchi();
    }
    return 0;
}
