@echo off
echo 验证knowledge-base移动结果
echo ========================================

set root_path=C:\Users\KSG\Downloads\皇帝游戏\成品
set knowledge_base_path=%root_path%\knowledge-base

echo 1. 检查knowledge-base是否存在:
echo    路径: %knowledge_base_path%
if exist "%knowledge_base_path%" (
    echo    ✓ knowledge-base存在
    dir "%knowledge_base_path%" /b | find /c /v "" > temp_count.txt
    set /p file_count=<temp_count.txt
    echo    文件总数: %file_count%
    del temp_count.txt
) else (
    echo    ✗ knowledge-base不存在
)

echo.
echo 2. 检查原始位置是否已清空:
set original_path=%root_path%\ai-context\docs\knowledge-base
echo    路径: %original_path%
if not exist "%original_path%" (
    echo    ✓ 原始位置已清空
) else (
    echo    ✗ 原始位置仍然存在
)

echo.
echo 3. 检查skill_routing_supplement.md是否存在:
set skill_routing_path=%knowledge_base_path%\skill_routing_supplement.md
echo    路径: %skill_routing_path%
if exist "%skill_routing_path%" (
    echo    ✓ skill_routing_supplement.md存在
) else (
    echo    ✗ skill_routing_supplement.md不存在
)

echo.
echo 验证完成
pause