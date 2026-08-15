#include <bits/stdc++.h>
using namespace std;

#define ll long long 
#define nmax ((int) 5e5) 

int n;
int a[nmax + 2];
vector < int > G[nmax + 2];

ll dp[nmax + 2][5][5];
ll dp_cur[5][5], dp_pre[5][5];

/*
Definitions:
- a[u] = 1 if u is black, and a[u] = 0 if u is white.
- T_u is the subtree rooted at u.
- A walk always has two endpoint roles. If its start and end are the
  same vertex, that vertex has both endpoint roles.

dp[u][x][y] is the minimum total use count of edges fully inside T_u.
It does NOT include the edge (parent[u], u). The state means:
- x in {0, 1, 2, 3}: use count of (parent[u], u), modulo 4.
- y in {0, 1, 2}: number of endpoint roles inside T_u.
- Every vertex in T_u satisfies its color parity condition.
- The selected part inside T_u is connected to u.

If the parent uses edge (parent[u], u) c times, the added cost is:
    c + dp[u][c % 4][y].

At every vertex u:
    D(u) + h(u) == 2 * a[u] (mod 4),
where D(u) is the total use count of edges incident to u, and h(u)
is the number of endpoint roles placed exactly at u.

*/

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
    // Postorder DFS: calculate all children before dp[u].
    // hasBlack[u] tells whether T_u contains a black vertex.
    hasBlack[u] = a[u];
    bool hasChild = 0;
    for (int v : G[u]) {
        if (v == p) continue;
        dfs(v, u);
        hasBlack[u] |= hasBlack[v];
        hasChild = 1;
    }

    if (hasChild == 0) {
        // Base case: u is a leaf, so T_u has no internal edge.
        // x is the parent-edge remainder, and y is h(u).
        // The parent-edge cost is not stored here, so the cost is 0.
        for (int x = 0; x <= 4; ++x) {
            for (int y = 0; y < 3; ++y) {
                if ((x + y - 2 * a[u] + 4) % 4 != 0) continue;
                dp[u][x % 4][y] = 0;
            }
        }
    }
    else {
        /*
        dp_pre[x][y] after merging some children of u:
        - x: total use count of selected edges (u, v), modulo 4.
        - y: number of endpoint roles in the selected child subtrees.
        - The value is the minimum cost of all merged edges.

        Before any child is merged: remainder = 0, endpoints = 0,
        and cost = 0.
        */
        for (int x = 0; x < 4; ++x) for (int y = 0; y < 3; ++y) dp_pre[x][y] = 1e18;
        dp_pre[0][0] = 0;

        for (int v : G[u]) {
            if (v == p) continue;

            // dp_cur stores the result after merging T_v.
            for (int x = 0; x < 4; ++x) {
                for (int y = 0; y < 3; ++y) {
                    dp_cur[x][y] = 1e18;
                }
            }

            // If T_v has no black vertex, we may skip the whole subtree.
            // Skipping it adds no edge, endpoint, or cost.
            if (!hasBlack[v]) {
                for (int x = 0; x < 4; ++x) {
                    for (int y = 0; y < 3; ++y) {
                        dp_cur[x][y] = dp_pre[x][y];
                    }
                }
            }

            /*
            Connect T_v to the current part:
            - c in [1, 4]: use count of edge (u, v).
            - y2: number of endpoint roles inside T_v.
            - dp[v][c % 4][y2] already checks parity at v and below v.
            - At u, edge (u, v) adds c to the remainder modulo 4.

            If hasBlack[v] is true, this choice is required because no
            skip state was added above. Otherwise, we may either skip T_v
            or connect it using c = 1..4.
            */
            for (int x = 0; x < 4; ++x) {
                for (int y = 0; y < 3; ++y) {
                    if (dp_pre[x][y] >= 1e18) continue;

                    for (int c = 1; c <= 4; ++c) {
                        for (int y2 = 0; y2 < 3 - y; ++y2) {
                            if (dp[v][c % 4][y2] >= 1e18) continue;

                            // Across cut (u, v), the edge-use parity equals
                            // the endpoint-count parity inside T_v.
                            if ((c & 1) != (y2 & 1)) continue;

                            dp_cur[(x + c) % 4][y + y2] = min(dp_cur[(x + c) % 4][y + y2], dp_pre[x][y] + c + dp[v][c % 4][y2]);
                        }
                    }
                }
            }

            // Use this result as the input table for the next child.
            for (int x = 0; x < 4; ++x) {
                for (int y = 0; y < 3; ++y) {
                    dp_pre[x][y] = dp_cur[x][y];
                }
            }
        }  
        
        /*
        Finish dp[u]:
        - x: remainder from all selected child edges of u.
        - y: number of endpoint roles inside the child subtrees.
        - y_u: number of endpoint roles placed exactly at u, or h(u).
        - x2: required remainder of edge (p, u).

        Choose x2 so that:
            x2 + x + y_u == 2 * a[u] (mod 4).
        The endpoint count inside T_u is then y + y_u.
        */
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

        // Use a black vertex as the root. Every valid walk must contain it,
        // so all selected edges are connected around tr_root.
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

    // The root has no parent edge, so its remainder is 0. A walk has two
    // endpoint roles. Its vertex count equals its edge-use count plus 1.
    cout << dp[tr_root][0][2] + 1 << '\n';
}

int main(){

    // freopen("COLOR.inp", "r", stdin);
    // freopen("COLOR.out", "w", stdout);

    int nTest = 1;
    // cin >> nTest;
    while (nTest--) {
        huyenchi();
    }
    return 0;
}
