#include <bits/stdc++.h>
using namespace std;

#define ll long long
#define nmax ((int) 5e5)

int n;
int a[nmax + 2];
vector < int > G[nmax + 2];

ll dp[nmax + 2][5][5];
ll dp_cur[5][5], dp_pre[5][5];

void mod_4(ll &x) {
    if (x > 4) x -= 4;
    if (x > 4) x -= 4;
    if (x < 0) x += 4;
}

int mod_4(ll x) {
    if (x > 4) x -= 4;
    if (x > 4) x -= 4;
    if (x < 0) x += 4;
    return x;
}

bool hasBlack[nmax + 2];
int tr_root;
void dfs(int u, int p) {

    hasBlack[u] = a[u];
    bool hasChild = 0;
    for (int v : G[u]) {
        if (v == p) continue;
        dfs(v, u);
        hasBlack[u] |= hasBlack[v];
        hasChild = 1;
    }

    if (hasChild == 0) {

        for (int x = 0; x <= 4; ++x) {
            for (int y = 0; y < 3; ++y) {
                if ((x + y - 2 * a[u] + 4) % 4 != 0) continue;
                dp[u][x % 4][y] = 0;
            }
        }
    }
    else {

        for (int x = 0; x < 4; ++x) for (int y = 0; y < 3; ++y) dp_pre[x][y] = 1e18;
        dp_pre[0][0] = 0;

        for (int v : G[u]) {
            if (v == p) continue;

            for (int x = 0; x < 4; ++x) {
                for (int y = 0; y < 3; ++y) {
                    dp_cur[x][y] = 1e18;
                }
            }

            if (!hasBlack[v]) {
                for (int x = 0; x < 4; ++x) {
                    for (int y = 0; y < 3; ++y) {
                        dp_cur[x][y] = dp_pre[x][y];
                    }
                }
            }


            for (int x = 0; x < 4; ++x) {
                for (int y = 0; y < 3; ++y) {
                    if (dp_pre[x][y] >= 1e18) continue;

                    for (int c = 1; c <= 4; ++c) {
                        for (int y2 = 0; y2 < 3 - y; ++y2) {
                            if (dp[v][c % 4][y2] >= 1e18) continue;

                            if ((c & 1) != (y2 & 1)) continue;

                            dp_cur[(x + c) % 4][y + y2] = min(dp_cur[(x + c) % 4][y + y2], dp_pre[x][y] + c + dp[v][c % 4][y2]);
                        }
                    }
                }
            }

            for (int x = 0; x < 4; ++x) {
                for (int y = 0; y < 3; ++y) {
                    dp_pre[x][y] = dp_cur[x][y];
                }
            }
        }


        for (int x = 0; x < 4; ++x) {
            for (int y = 0; y < 3; ++y) {
                for (int y_u = 0; y_u < 3 - y; ++y_u) {
                    int x2 = (- (x + y_u - 2 * a[u]) % 4 + 4) % 4;
                    if ((x + x2 + y_u - 2 * a[u] + 4) % 4 != 0) continue;
                    dp[u][x2][y + y_u] = min(dp[u][x2][y + y_u], dp_cur[x][y]);
                }
            }
        }
    }
}

void huyenchi() {
    cin >> n;
    for (int i = 1; i <= n; ++i) {
        char c; cin >> c;
        a[i] = (c - '0') ^ 1;

        if (a[i]) tr_root = i;
    }
    for (int i = 1; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    for (int i = 1; i <= nmax; ++i) for (int i2 = 0; i2 < 5; ++i2) for (int i3 = 0; i3 < 5; ++i3) dp[i][i2][i3] = 1e18;

    dfs(tr_root, 0);

    cout << dp[tr_root][0][2] + 1 << '\n';
}

int main(){

    int nTest = 1;

    while (nTest--) {
        huyenchi();
    }
    return 0;
}
