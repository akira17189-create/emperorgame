import os
import sys

root_path = r"C:\Users\KSG\Downloads\皇帝游戏\成品"
knowledge_base_path = os.path.join(root_path, "knowledge-base")

print("=" * 60)
print("验证knowledge-base移动结果")
print("=" * 60)

# 1. 检查knowledge-base是否存在
print(f"1. 检查knowledge-base是否存在:")
print(f"   路径: {knowledge_base_path}")
if os.path.exists(knowledge_base_path):
    print("   ✓ knowledge-base存在")
    
    # 统计文件数量
    file_count = 0
    for dirpath, dirnames, filenames in os.walk(knowledge_base_path):
        file_count += len(filenames)
    print(f"   文件总数: {file_count}")
else:
    print("   ✗ knowledge-base不存在")
    sys.exit(1)

# 2. 检查原始位置是否已清空
original_path = os.path.join(root_path, "ai-context", "docs", "knowledge-base")
print(f"\n2. 检查原始位置是否已清空:")
print(f"   路径: {original_path}")
if not os.path.exists(original_path):
    print("   ✓ 原始位置已清空")
else:
    print("   ✗ 原始位置仍然存在")

# 3. 检查skill_routing_supplement.md是否存在
skill_routing_path = os.path.join(knowledge_base_path, "skill_routing_supplement.md")
print(f"\n3. 检查skill_routing_supplement.md是否存在:")
print(f"   路径: {skill_routing_path}")
if os.path.exists(skill_routing_path):
    print("   ✓ skill_routing_supplement.md存在")
    
    # 读取文件内容验证
    with open(skill_routing_path, 'r', encoding='utf-8') as f:
        content = f.read()
        print(f"   文件大小: {len(content)} 字符")
else:
    print("   ✗ skill_routing_supplement.md不存在")

# 4. 检查相对路径
skills_ts_path = os.path.join(root_path, "ai-context", "src", "engine", "skills.ts")
print(f"\n4. 检查相对路径:")
print(f"   skills.ts路径: {skills_ts_path}")
if os.path.exists(skills_ts_path):
    print("   ✓ skills.ts存在")
    
    # 读取skills.ts检查注释
    with open(skills_ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
        if 'knowledge-base' in content:
            print("   ✓ skills.ts中包含knowledge-base引用")
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'knowledge-base' in line:
                    print(f"     第{i+1}行: {line.strip()}")
        else:
            print("   ✗ skills.ts中没有knowledge-base引用")
else:
    print("   ✗ skills.ts不存在")

print("\n" + "=" * 60)
print("验证完成")
print("=" * 60)