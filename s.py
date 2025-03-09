from collections import deque

def is_solvable(level):
    # 预处理：找到玩家、箱子、目标点的初始位置
    start_player = None
    start_boxes = []
    targets = []
    for i in range(len(level)):
        for j in range(len(level[i])):
            if level[i][j] == 4:
                start_player = (i, j)
            elif level[i][j] == 2:
                start_boxes.append((i, j))
            elif level[i][j] == 3:
                targets.append((i, j))

    # 检查箱子与目标点数量是否匹配
    if len(start_boxes) != len(targets):
        return False

    # 方向：上下左右
    dirs = [(-1,0), (1,0), (0,-1), (0,1)]

    # 状态队列：(player_pos, boxes_pos), 使用集合记录已访问状态
    visited = set()
    queue = deque()
    initial_state = (start_player, tuple(sorted(start_boxes)))
    queue.append(initial_state)
    visited.add((start_player, tuple(sorted(start_boxes))))

    while queue:
        player, boxes = queue.popleft()

        # 检查是否所有箱子都在目标点
        if all(b in targets for b in boxes):
            return True

        # 生成所有可能的移动方向
        for dx, dy in dirs:
            new_p = (player[0] + dx, player[1] + dy)

            # 检查新位置是否越界或为墙壁
            if not (0 <= new_p[0] < len(level) and 0 <= new_p[1] < len(level[0])):
                continue
            if level[new_p[0]][new_p[1]] == 1:
                continue

            # 如果新位置是箱子，检查是否可以推动
            if new_p in boxes:
                # 计算箱子新位置
                new_b = (new_p[0] + dx, new_p[1] + dy)
                if (not (0 <= new_b[0] < len(level) and 0 <= new_b[1] < len(level[0])) or
                    level[new_b[0]][new_b[1]] == 1 or
                    new_b in boxes):
                    continue  # 推动后位置无效

                # 生成新的箱子列表
                new_boxes = list(boxes)
                new_boxes.remove(new_p)
                new_boxes.append(new_b)
                new_boxes_sorted = tuple(sorted(new_boxes))
                new_player = new_p

                # 检查死锁：如箱子被推到角落且非目标点
                if is_deadlock(new_b, new_boxes_sorted, targets, level):
                    continue

                # 检查是否已访问
                state = (new_player, new_boxes_sorted)
                if state not in visited:
                    visited.add(state)
                    queue.append(state)
            else:
                # 普通移动，未推动箱子
                state = (new_p, tuple(sorted(boxes)))
                if state not in visited:
                    visited.add(state)
                    queue.append(state)

    return False

def is_deadlock(box_pos, boxes, targets, level):
    # 简单死锁检测：箱子在角落且不在目标点
    x, y = box_pos
    if box_pos in targets:
        return False
    # 检查左右是否为墙壁或边界，上下同理
    left = level[x][y-1] == 1 if y > 0 else True
    right = level[x][y+1] == 1 if y < len(level[0])-1 else True
    up = level[x-1][y] == 1 if x > 0 else True
    down = level[x+1][y] == 1 if x < len(level)-1 else True
    if (left and up) or (left and down) or (right and up) or (right and down):
        return True
    return False

# 调用示例
level = [ [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 3, 0, 0, 0, 0, 1, 0, 0],
            [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 4, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] ]  # 用户提供的地图
print(is_solvable(level))
