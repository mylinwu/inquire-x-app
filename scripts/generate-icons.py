"""
生成 Inquire X App 的图标和启动屏图片
使用 Pillow 库创建图形
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("请先安装 Pillow: pip install Pillow")
    exit(1)

def create_gradient_background(size, color1, color2):
    """创建渐变背景"""
    img = Image.new('RGBA', size, color1)
    draw = ImageDraw.Draw(img)
    
    # 创建渐变效果
    for i in range(size[1]):
        ratio = i / size[1]
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, i), (size[0], i)], fill=(r, g, b, 255))
    
    return img

def draw_sparkle_icon(draw, center_x, center_y, size, color):
    """绘制星光图标（代表探索和洞察）"""
    # 主要的四个方向光线
    points = []
    
    # 创建四芒星
    for angle in [0, 90, 180, 270]:
        import math
        rad = math.radians(angle)
        # 外点
        x1 = center_x + math.cos(rad) * size
        y1 = center_y + math.sin(rad) * size
        # 内点（45度偏移）
        rad2 = math.radians(angle + 45)
        x2 = center_x + math.cos(rad2) * (size * 0.3)
        y2 = center_y + math.sin(rad2) * (size * 0.3)
        points.extend([(x1, y1), (x2, y2)])
    
    draw.polygon(points, fill=color)
    
    # 绘制中心圆点
    circle_size = size * 0.4
    draw.ellipse([
        center_x - circle_size, center_y - circle_size,
        center_x + circle_size, center_y + circle_size
    ], fill=color)

def create_icon(output_path, size=1024):
    """创建主图标 - 简洁的现代设计"""
    # 渐变背景 - 从深紫到蓝色
    color1 = (99, 102, 241)  # Indigo
    color2 = (139, 92, 246)  # Purple
    
    img = create_gradient_background((size, size), color1, color2)
    draw = ImageDraw.Draw(img)
    
    # 绘制星光符号（代表探索和智慧）
    draw_sparkle_icon(draw, size//2, size//2, size//3, (255, 255, 255, 255))
    
    # 保存
    img.save(output_path, 'PNG', quality=95)
    print(f"✓ 创建图标: {output_path}")

def create_android_adaptive_icon_foreground(output_path, size=1024):
    """创建 Android 自适应图标前景"""
    # 透明背景
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制白色星光图标
    draw_sparkle_icon(draw, size//2, size//2, size//3.5, (255, 255, 255, 255))
    
    img.save(output_path, 'PNG')
    print(f"✓ 创建 Android 前景图标: {output_path}")

def create_android_adaptive_icon_background(output_path, size=1024):
    """创建 Android 自适应图标背景"""
    # 渐变背景
    color1 = (99, 102, 241)  # Indigo
    color2 = (139, 92, 246)  # Purple
    
    img = create_gradient_background((size, size), color1, color2)
    img.save(output_path, 'PNG')
    print(f"✓ 创建 Android 背景图标: {output_path}")

def create_android_monochrome_icon(output_path, size=1024):
    """创建 Android 单色图标"""
    # 透明背景
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制白色星光图标
    draw_sparkle_icon(draw, size//2, size//2, size//3.5, (255, 255, 255, 255))
    
    img.save(output_path, 'PNG')
    print(f"✓ 创建 Android 单色图标: {output_path}")

def create_favicon(output_path, size=48):
    """创建网页 favicon"""
    # 渐变背景
    color1 = (99, 102, 241)
    color2 = (139, 92, 246)
    
    img = create_gradient_background((size, size), color1, color2)
    draw = ImageDraw.Draw(img)
    
    # 绘制星光图标
    draw_sparkle_icon(draw, size//2, size//2, size//3.5, (255, 255, 255, 255))
    
    img.save(output_path, 'PNG')
    print(f"✓ 创建 Favicon: {output_path}")

def create_splash_icon(output_path, size=400):
    """创建启动屏图标"""
    # 透明背景
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 渐变圆形背景
    circle_color1 = (99, 102, 241, 255)
    circle_color2 = (139, 92, 246, 255)
    
    # 绘制渐变圆形
    for i in range(size//2, 0, -1):
        ratio = i / (size//2)
        r = int(circle_color1[0] * ratio + circle_color2[0] * (1 - ratio))
        g = int(circle_color1[1] * ratio + circle_color2[1] * (1 - ratio))
        b = int(circle_color1[2] * ratio + circle_color2[2] * (1 - ratio))
        
        draw.ellipse([
            size//2 - i, size//2 - i,
            size//2 + i, size//2 + i
        ], fill=(r, g, b, 255))
    
    # 绘制白色星光图标
    draw_sparkle_icon(draw, size//2, size//2, size//4, (255, 255, 255, 255))
    
    img.save(output_path, 'PNG')
    print(f"✓ 创建启动屏图标: {output_path}")

def main():
    # 获取项目根目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    assets_dir = os.path.join(project_dir, 'assets', 'images')
    
    print("🎨 开始生成 Inquire X 图标和启动屏...\n")
    
    # 创建主图标 (1024x1024)
    create_icon(os.path.join(assets_dir, 'icon.png'), 1024)
    
    # 创建 Android 自适应图标组件
    create_android_adaptive_icon_foreground(
        os.path.join(assets_dir, 'android-icon-foreground.png'), 1024
    )
    create_android_adaptive_icon_background(
        os.path.join(assets_dir, 'android-icon-background.png'), 1024
    )
    create_android_monochrome_icon(
        os.path.join(assets_dir, 'android-icon-monochrome.png'), 1024
    )
    
    # 创建 Favicon (48x48)
    create_favicon(os.path.join(assets_dir, 'favicon.png'), 48)
    
    # 创建启动屏图标 (400x400)
    create_splash_icon(os.path.join(assets_dir, 'splash-icon.png'), 400)
    
    print("\n✅ 所有图标生成完成！")
    print("\n提示：")
    print("  • 主图标已更新为渐变星光设计")
    print("  • Android 自适应图标已生成")
    print("  • 启动屏图标已生成")
    print("  • 所有图标已保存到 assets/images 目录")

if __name__ == '__main__':
    main()
