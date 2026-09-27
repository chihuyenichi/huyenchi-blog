#include <bits/stdc++.h>
using namespace std;

#define ll long long
#define nmax ((int) 1e5 + 2)
#define block_size ((int) 5e2)

struct single_list {
    int id;
    int next, prev;

    bool operator==(const single_list &other) const {
    return id == other.id && next == other.next && prev == other.prev;
}
}  a_link[nmax], b_link[nmax];

struct block_struct {
    int freq[nmax];
    int pointer[2];
} block[nmax / block_size + 1];

void block_chfreq(block_struct &x, int val, int d) {
    x.freq[val] += d;
}

int a[nmax];
int n;

int block_getid(int i) {
    return i / block_size;
}

int Q;
array < int, 4 > qs[nmax];

void fix_relation_linked(int id, int next, int prev) {
    if (next != -2) {
        a_link[id].next = next;
        a_link[a_link[id].next].prev = id;
    }

    if (prev != -2) {
        a_link[id].prev = prev;
        a_link[a_link[id].prev].next = id;
    }
}

int block_idStart(int id) {
    return max(1, block_size * id);
}

int block_idEnd(int id) {
    return min(n, block_size * (id + 1) - 1);
}

int iterator_from_pos(int l) {
    int id = block_getid(l);
    int begin = block[id].pointer[0];
    for (int i = block_idStart(id) + 1; i <= l; ++i) {
        begin = a_link[begin].next;
    }
    return begin;
}

void rot_segment_inside(int l, int r) {
    int blockid = block_getid(l);

    int old_begin = iterator_from_pos(l);
    int old_last = iterator_from_pos(r);

    auto tmp = a_link[old_last];
    fix_relation_linked(old_last, old_begin, a_link[old_begin].prev);

    int old_last_2 = tmp.prev;
    fix_relation_linked(old_last_2, tmp.next, -2);

    if (l == block_idStart(blockid)) block[blockid].pointer[0] = old_last;
    if (r == block_idEnd(blockid)) block[blockid].pointer[1] = old_last_2;
}

void rot_segment(int l, int r) {
    int l_blockid = block_getid(l);
    int r_blockid = block_getid(r);

    if (l_blockid == r_blockid) {
        if (l != r)
            rot_segment_inside(l, r);
    }

    else {

        for (int b_id = l_blockid + 1; b_id < r_blockid; ++b_id) {
            int old_begin = block[b_id].pointer[0];
            int old_last = block[b_id].pointer[1];

            block_chfreq(block[b_id], a[a_link[old_last].id], -1);

            block[b_id].pointer[0] = a_link[block[b_id].pointer[0]].prev;
            block[b_id].pointer[1] = a_link[block[b_id].pointer[1]].prev;

            block_chfreq(block[b_id], a[a_link[a_link[old_begin].prev].id], 1);
        }

        int old_begin, old_last;

        old_begin = iterator_from_pos(l);
        old_last = iterator_from_pos(r);

        block_chfreq(block[l_blockid], a[a_link[block[l_blockid].pointer[1]].id], -1);
        block_chfreq(block[r_blockid], a[a_link[old_last].id], -1);

        {
            int last_prev_r_blockid = a_link[block[r_blockid].pointer[0]].prev;
            block_chfreq(block[r_blockid], a[a_link[last_prev_r_blockid].id], 1);
        }

        block_chfreq(block[l_blockid], a[a_link[old_last].id], 1);

        auto tmp = a_link[old_last];
        int old_last_2 = tmp.prev;

        fix_relation_linked(old_last, old_begin, a_link[old_begin].prev);
        fix_relation_linked(old_last_2, tmp.next, -2);

        if (l == block_idStart(l_blockid)) block[l_blockid].pointer[0] = old_last;
        if (r == block_idEnd(r_blockid)) block[r_blockid].pointer[1] = old_last_2;

        int last_pos = block_idEnd(l_blockid);
        block[l_blockid].pointer[1] = iterator_from_pos(last_pos);

        int prev_first_pos = block[r_blockid - 1].pointer[1];
        block[r_blockid].pointer[0] = a_link[prev_first_pos].next;
    }
}

int count_segment_inside(int l, int r, int x) {
    int l_blockid = block_getid(l);
    int ans = 0;
    int begin = block_idStart(l_blockid);
    int start = iterator_from_pos(l);
    ans += a[a_link[start].id] == x;

    for (int i = l + 1; i <= r; ++i) {
        start = a_link[start].next;
        ans += a[a_link[start].id] == x;
    }

    return ans;
}

int count_segment(int l, int r, int x) {
    int l_blockid = block_getid(l);
    int r_blockid = block_getid(r);

    if (l_blockid == r_blockid) {
        int ans = count_segment_inside(l, r, x);
        return ans;
    }

    else {
        int ans = 0;

        for (int i = l_blockid + 1; i < r_blockid; ++i) {
            ans += block[i].freq[x];
        }

        ans += count_segment_inside(l, block_idEnd(l_blockid), x);

        ans += count_segment_inside(block_idStart(r_blockid), r, x);

        return ans;
    }
}

int main(){

    cin >> n;

    a_link[0].next = 1;
    a_link[n + 1].prev = n;

    for (int i = 1; i <= n; ++i) {
        cin >> a[i];
        a_link[i].id = i;
        a_link[i].next = i + 1;
        a_link[i].prev = i - 1;
        block[block_getid(i)].freq[a[i]]++;
    }

    for (int b_id = 0; b_id <= n / block_size; ++b_id) {
        block[b_id].pointer[0] = max(1, block_size * b_id);
        block[b_id].pointer[1] = min(n, block_size * (b_id + 1) - 1);
    }

    cin >> Q;
    int lastans = 0;

    for (int i = 0; i < Q; ++i) {
        int type;
        cin >> type;
        auto &[x, y, z, t] = qs[i];
        cin >> y >> z;
        if (type == 2) cin >> t;
        x = type;
    }

    for (int _i = 0; _i < Q; ++_i) {
        auto [_, l, r, val] = qs[_i];

        l = (l + lastans - 1) % n + 1;
        r = (r + lastans - 1) % n + 1;
        if (l > r) swap(l, r);

        if (qs[_i][0] == 1) {

            rot_segment(l, r);
        }
        else {

            val = (val + lastans - 1) % n + 1;
            int ans = count_segment(l, r, val);
            cout << ans << '\n';
            lastans = ans;
        }
    }

    return 0;
}
