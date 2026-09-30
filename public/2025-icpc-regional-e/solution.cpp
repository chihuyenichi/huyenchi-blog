#include <bits/stdc++.h>
using namespace std;

struct Dinic {
    struct Edge {
        int to, rev, cap;
    };

    vector<vector<Edge>> graph;
    vector<int> level, it;

    explicit Dinic(int n) : graph(n), level(n), it(n) {}

    void add_directed(int u, int v, int cap) {
        Edge a{v, (int)graph[v].size(), cap};
        Edge b{u, (int)graph[u].size(), 0};
        graph[u].push_back(a);
        graph[v].push_back(b);
    }

    void add_undirected_unit(int u, int v) {
        add_directed(u, v, 1);
        add_directed(v, u, 1);
    }

    bool bfs(int s, int t) {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        level[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (const Edge &e : graph[u]) {
                if (e.cap > 0 && level[e.to] == -1) {
                    level[e.to] = level[u] + 1;
                    q.push(e.to);
                }
            }
        }
        return level[t] != -1;
    }

    int dfs(int u, int t, int pushed) {
        if (u == t || pushed == 0) return pushed;
        for (int &i = it[u]; i < (int)graph[u].size(); ++i) {
            Edge &e = graph[u][i];
            if (e.cap <= 0 || level[e.to] != level[u] + 1) continue;
            int flow = dfs(e.to, t, min(pushed, e.cap));
            if (flow == 0) continue;
            e.cap -= flow;
            graph[e.to][e.rev].cap += flow;
            return flow;
        }
        return 0;
    }

    int maxflow(int s, int t) {
        int flow = 0;
        while (bfs(s, t)) {
            fill(it.begin(), it.end(), 0);
            while (int pushed = dfs(s, t, INT_MAX)) {
                flow += pushed;
            }
        }
        return flow;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int tc;
    cin >> tc;
    while (tc--) {
        int n, m;
        cin >> n >> m;

        vector<int> district(n);
        for (int &x : district) cin >> x;

        int source = n;
        int sink = n + 1;
        int inf = m + 5;
        Dinic dinic(n + 2);

        for (int i = 0; i < m; ++i) {
            int u, v;
            cin >> u >> v;
            --u;
            --v;
            if (u != v) dinic.add_undirected_unit(u, v);
        }

        for (int v = 0; v < n; ++v) {
            if (district[v] == 1 || district[v] == 3) {
                dinic.add_directed(source, v, inf);
            } else {
                dinic.add_directed(v, sink, inf);
            }
        }

        cout << dinic.maxflow(source, sink) << '\n';
    }

    return 0;
}
