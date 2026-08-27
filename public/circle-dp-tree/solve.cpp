#include <bits/stdc++.h>
using namespace std;

#define nmax 3000

int n, Q;
vector<int> G[nmax + 2];
int A, B;
int a[nmax + 2];

bool inCir[nmax + 2];
vector<int> cir_list;

// dp[u][press_u][base_color_u] = 1
//
// Xét cây treo gốc u sau khi bỏ các cạnh thuộc chu trình.
//
// Ý nghĩa:
// - mọi đỉnh con đúng nghĩa của u đều đã xanh hoàn toàn;
// - press_u là việc có bấm u hay không;
// - base_color_u là màu của u sau khi:
//   + bắt đầu từ a[u],
//   + bấm u nếu press_u = 1,
//   + nhận tác động từ toàn bộ các con ngoài chu trình được bấm,
//   nhưng chưa nhận tác động từ cha của u.
//
// Công thức:
//   base_color_u = a[u] xor press_u xor xor_press_children
char dp[nmax + 2][2][2];

int encodeState(int pressed, int color) {
    return pressed | (color << 1);
}

int getPressed(int mask) {
    return mask & 1;
}

int getColor(int mask) {
    return (mask >> 1) & 1;
}

bool isBlue(int color, int left_press, int right_press) {
    return (color ^ left_press ^ right_press) == 1;
}

bool dfs_cir(int u, int p) {
    if (u == B) {
        inCir[u] = 1;
        return true;
    }
    for (int v : G[u]) {
        if (v == p) continue;
        if (dfs_cir(v, u)) {
            inCir[u] = 1;
            cir_list.push_back(v);
            return true;
        }
    }
    inCir[u] = 0;
    return false;
}

void buildTreeDp(int u, int p) {
    memset(dp[u], 0, sizeof(dp[u]));

    for (int v : G[u]) {
        if (v == p || inCir[v]) continue;
        buildTreeDp(v, u);
    }

    // merge_ok[child_xor][press_u] = 1
    //
    // Sau khi ghép xong một số con của u:
    // - child_xor là xor của các con đã chọn bấm;
    // - press_u cố định.
    //
    // Khi ghép thêm con v, trạng thái của v phải thỏa:
    //   color_v xor press_u = 1
    // vì color_v là màu của v trước khi bị cha u tác động.
    int merge_ok[2][2] = {};
    int prev_ok[2][2] = {};

    // Chưa có con nào: xor số con được bấm bằng 0.
    for (int press_u = 0; press_u < 2; ++press_u) {
        merge_ok[0][press_u] = 1;
    }

    for (int v : G[u]) {
        if (v == p || inCir[v]) continue;

        memcpy(prev_ok, merge_ok, sizeof(merge_ok));
        memset(merge_ok, 0, sizeof(merge_ok));

        for (int child_xor = 0; child_xor < 2; ++child_xor) {
            for (int press_u = 0; press_u < 2; ++press_u) {
                if (!prev_ok[child_xor][press_u]) continue;

                for (int press_v = 0; press_v < 2; ++press_v) {
                    for (int color_v = 0; color_v < 2; ++color_v) {
                        if (!dp[v][press_v][color_v]) continue;
                        if (!isBlue(color_v, press_u, 0)) continue;

                        merge_ok[child_xor ^ press_v][press_u] = 1;
                    }
                }
            }
        }
    }

    for (int press_u = 0; press_u < 2; ++press_u) {
        for (int child_xor = 0; child_xor < 2; ++child_xor) {
            if (!merge_ok[child_xor][press_u]) continue;

            int base_color_u = a[u] ^ press_u ^ child_xor;
            dp[u][press_u][base_color_u] = 1;
        }
    }
}

bool traceTree(int u, int p, int press_u, int base_color_u, vector<int>& answer) {
    vector<int> children;
    for (int v : G[u]) {
        if (v == p || inCir[v]) continue;
        children.push_back(v);
    }

    // Từ công thức:
    //   base_color_u = a[u] xor press_u xor xor_press_children
    // suy ra xor_press_children cần đạt là:
    int need_child_xor = a[u] ^ press_u ^ base_color_u;

    int k = (int)children.size();
    vector<array<int, 2>> reach(k + 1, {0, 0});
    vector<array<int, 2>> prev_xor(k + 1, {-1, -1});
    vector<array<int, 2>> chosen_press(k + 1, {-1, -1});
    vector<array<int, 2>> chosen_color(k + 1, {-1, -1});

    reach[0][0] = 1;

    for (int i = 0; i < k; ++i) {
        int v = children[i];
        for (int cur_xor = 0; cur_xor < 2; ++cur_xor) {
            if (!reach[i][cur_xor]) continue;

            for (int press_v = 0; press_v < 2; ++press_v) {
                for (int color_v = 0; color_v < 2; ++color_v) {
                    if (!dp[v][press_v][color_v]) continue;
                    if (!isBlue(color_v, press_u, 0)) continue;

                    int next_xor = cur_xor ^ press_v;
                    if (reach[i + 1][next_xor]) continue;

                    reach[i + 1][next_xor] = 1;
                    prev_xor[i + 1][next_xor] = cur_xor;
                    chosen_press[i + 1][next_xor] = press_v;
                    chosen_color[i + 1][next_xor] = color_v;
                }
            }
        }
    }

    if (!reach[k][need_child_xor]) {
        return false;
    }

    vector<int> take_press(k), take_color(k);
    int cur_xor = need_child_xor;
    for (int i = k; i >= 1; --i) {
        take_press[i - 1] = chosen_press[i][cur_xor];
        take_color[i - 1] = chosen_color[i][cur_xor];
        cur_xor = prev_xor[i][cur_xor];
    }

    for (int i = 0; i < k; ++i) {
        if (!traceTree(children[i], u, take_press[i], take_color[i], answer)) {
            return false;
        }
    }

    if (press_u) {
        answer.push_back(u);
    }
    return true;
}

bool solveQuery(vector<int>& answer) {
    for (int v : cir_list) {
        buildTreeDp(v, 0);
    }

    int m = (int)cir_list.size();
    if (m < 3) return false;

    // Cycle DP.
    //
    // Với đỉnh trên chu trình, gọi base_color_i là trạng thái từ dp như trên,
    // tức là màu của đỉnh i trước khi nhận 2 tác động từ 2 hàng xóm trên chu trình.
    //
    // Màu cuối cùng của đỉnh i là:
    //   final_color_i = base_color_i xor press_{i-1} xor press_{i+1}
    //
    // Khi duyệt từ trái sang phải trên chu trình:
    // - current_color_i = base_color_i xor press_{i-1}
    //   là màu của đỉnh i sau khi đã nhận tác động từ đỉnh trước,
    //   nhưng chưa nhận tác động từ đỉnh sau.
    //
    // Khi chọn press_{i+1}, ta chốt được đỉnh i bằng điều kiện:
    //   current_color_i xor press_{i+1} = 1
    //
    // Riêng đỉnh đầu v0 không thể chốt sớm vì còn phụ thuộc đỉnh cuối.
    // Nên sau khi chọn (v0, v1), ta mang theo:
    //   pending_color_0 = base_color_0 xor press_1
    // và chỉ kiểm tra nó ở bước khép chu trình với press_last.

    int reach_prev[4][4] = {};
    int reach_cur[4][4] = {};

    static int pre_mask[nmax + 2][4][4];
    for (int i = 0; i < m; ++i) {
        for (int x = 0; x < 4; ++x) {
            for (int y = 0; y < 4; ++y) {
                pre_mask[i][x][y] = -1;
            }
        }
    }

    int v0 = cir_list[0];
    int v1 = cir_list[1];

    // Khởi tạo đặc biệt bằng cặp (v0, v1).
    for (int press_0 = 0; press_0 < 2; ++press_0) {
        for (int base_color_0 = 0; base_color_0 < 2; ++base_color_0) {
            if (!dp[v0][press_0][base_color_0]) continue;

            for (int press_1 = 0; press_1 < 2; ++press_1) {
                for (int base_color_1 = 0; base_color_1 < 2; ++base_color_1) {
                    if (!dp[v1][press_1][base_color_1]) continue;

                    int pending_color_0 = base_color_0 ^ press_1;
                    int current_color_1 = base_color_1 ^ press_0;

                    int current_mask = encodeState(press_1, current_color_1);
                    int start_info = encodeState(press_0, pending_color_0);

                    reach_prev[current_mask][start_info] = 1;
                    pre_mask[1][current_mask][start_info] = -2;
                }
            }
        }
    }

    for (int i = 2; i < m; ++i) {
        int u = cir_list[i];
        memset(reach_cur, 0, sizeof(reach_cur));

        for (int prev_mask = 0; prev_mask < 4; ++prev_mask) {
            int prev_press = getPressed(prev_mask);
            int prev_color = getColor(prev_mask);

            for (int start_info = 0; start_info < 4; ++start_info) {
                if (!reach_prev[prev_mask][start_info]) continue;

                int press_0 = getPressed(start_info);
                int pending_color_0 = getColor(start_info);

                for (int press_u = 0; press_u < 2; ++press_u) {
                    // Chọn press_u để chốt đỉnh trước:
                    //   prev_color xor press_u = 1
                    if (!isBlue(prev_color, press_u, 0)) continue;

                    for (int base_color_u = 0; base_color_u < 2; ++base_color_u) {
                        if (!dp[u][press_u][base_color_u]) continue;

                        int current_color_u = base_color_u ^ prev_press;
                        int current_mask = encodeState(press_u, current_color_u);

                        if (i == m - 1) {
                            // Khép chu trình:
                            // - đỉnh cuối nhận thêm press_0
                            // - đỉnh đầu nhận thêm press_last
                            if (!isBlue(current_color_u, press_0, 0)) continue;
                            if (!isBlue(pending_color_0, press_u, 0)) continue;
                        }

                        if (!reach_cur[current_mask][start_info]) {
                            reach_cur[current_mask][start_info] = 1;
                            pre_mask[i][current_mask][start_info] = prev_mask;
                        }
                    }
                }
            }
        }

        memcpy(reach_prev, reach_cur, sizeof(reach_cur));
    }

    int final_mask = -1;
    int final_start_info = -1;
    for (int current_mask = 0; current_mask < 4 && final_mask == -1; ++current_mask) {
        for (int start_info = 0; start_info < 4; ++start_info) {
            if (reach_prev[current_mask][start_info]) {
                final_mask = current_mask;
                final_start_info = start_info;
                break;
            }
        }
    }

    if (final_mask == -1) {
        return false;
    }

    vector<int> cycle_mask(m, -1);
    vector<int> press(m, 0);
    vector<int> base_color(m, 0);

    cycle_mask[m - 1] = final_mask;
    int current_mask = final_mask;
    for (int i = m - 1; i >= 2; --i) {
        int prev_mask = pre_mask[i][current_mask][final_start_info];
        cycle_mask[i - 1] = prev_mask;
        current_mask = prev_mask;
    }

    press[0] = getPressed(final_start_info);
    for (int i = 1; i < m; ++i) {
        press[i] = getPressed(cycle_mask[i]);
    }

    // Từ:
    //   current_color_i = base_color_i xor press_{i-1}
    // suy ra:
    //   base_color_i = current_color_i xor press_{i-1}
    base_color[0] = getColor(final_start_info) ^ press[1];
    for (int i = 1; i < m; ++i) {
        base_color[i] = getColor(cycle_mask[i]) ^ press[i - 1];
    }

    answer.clear();
    for (int i = 0; i < m; ++i) {
        if (!traceTree(cir_list[i], 0, press[i], base_color[i], answer)) {
            return false;
        }
    }

    return true;
}

void solve() {
    cin >> n >> Q;
    for (int i = 1; i <= n; ++i) {
        G[i].clear();
    }

    for (int i = 1; i < n; ++i) {
        int u, v;
        cin >> u >> v;
        G[u].push_back(v);
        G[v].push_back(u);
    }

    cin >> A >> B;

    fill(inCir, inCir + n + 1, false);
    cir_list.clear();
    dfs_cir(A, 0);
    cir_list.push_back(A);

    for (int query = 0; query < Q; ++query) {
        for (int i = 1; i <= n; ++i) {
            cin >> a[i];
        }

        vector<int> answer;
        if (!solveQuery(answer)) {
            cout << -1 << '\n';
            continue;
        }

        cout << answer.size();
        for (int u : answer) {
            cout << ' ' << u;
        }
        cout << '\n';
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
    return 0;
}
