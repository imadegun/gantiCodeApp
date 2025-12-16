import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get main product details with all related material and tool information
    const productSql = `
      SELECT
        tm.*,
        td.DesignName,
        tc.CategoryName,
        ts.SizeName,
        ttx.TextureName,
        tmt.MaterialName,
        tcl.ColorName,
        tbcl.ClayCode,
        tbcl.ClayDescription,
        -- Glaze information
        glz1.GlazeCode as Glaze1Code, glz1.GlazeDescription as Glaze1Description,
        glz2.GlazeCode as Glaze2Code, glz2.GlazeDescription as Glaze2Description,
        glz3.GlazeCode as Glaze3Code, glz3.GlazeDescription as Glaze3Description,
        glz4.GlazeCode as Glaze4Code, glz4.GlazeDescription as Glaze4Description,
        -- Texture information
        txt1.TextureCode as Texture1Code, txt1.TextureDescription as Texture1Description, txt1.TexturePhoto1 as Texture1Photo,
        txt2.TextureCode as Texture2Code, txt2.TextureDescription as Texture2Description, txt2.TexturePhoto1 as Texture2Photo,
        txt3.TextureCode as Texture3Code, txt3.TextureDescription as Texture3Description, txt3.TexturePhoto1 as Texture3Photo,
        txt4.TextureCode as Texture4Code, txt4.TextureDescription as Texture4Description, txt4.TexturePhoto1 as Texture4Photo,
        -- Engobe information
        eng1.EngobeCode as Engobe1Code, eng1.EngobeDescription as Engobe1Description, eng1.EngobePhoto1 as Engobe1Photo,
        eng2.EngobeCode as Engobe2Code, eng2.EngobeDescription as Engobe2Description, eng2.EngobePhoto1 as Engobe2Photo,
        eng3.EngobeCode as Engobe3Code, eng3.EngobeDescription as Engobe3Description, eng3.EngobePhoto1 as Engobe3Photo,
        eng4.EngobeCode as Engobe4Code, eng4.EngobeDescription as Engobe4Description, eng4.EngobePhoto1 as Engobe4Photo,
        -- Estruder information
        est1.EstruderCode as Estruder1Code, est1.EstruderDescription as Estruder1Description, est1.EstruderPhoto1 as Estruder1Photo,
        est2.EstruderCode as Estruder2Code, est2.EstruderDescription as Estruder2Description, est2.EstruderPhoto1 as Estruder2Photo,
        est3.EstruderCode as Estruder3Code, est3.EstruderDescription as Estruder3Description, est3.EstruderPhoto1 as Estruder3Photo,
        est4.EstruderCode as Estruder4Code, est4.EstruderDescription as Estruder4Description, est4.EstruderPhoto1 as Estruder4Photo,
        -- Tools information
        tls1.ToolsCode as Tools1Code, tls1.ToolsDescription as Tools1Description, tls1.ToolsPhoto1 as Tools1Photo,
        tls2.ToolsCode as Tools2Code, tls2.ToolsDescription as Tools2Description, tls2.ToolsPhoto1 as Tools2Photo,
        tls3.ToolsCode as Tools3Code, tls3.ToolsDescription as Tools3Description, tls3.ToolsPhoto1 as Tools3Photo,
        tls4.ToolsCode as Tools4Code, tls4.ToolsDescription as Tools4Description, tls4.ToolsPhoto1 as Tools4Photo,
        tbu.UnitValue,
        lst.LustreCode as LusterCode, lst.LustreDescription as LusterDescription,
        -- Additional luster information
        lst2.LustreCode as Luster2Code, lst2.LustreDescription as Luster2Description,
        lst3.LustreCode as Luster3Code, lst3.LustreDescription as Luster3Description,
        lst4.LustreCode as Luster4Code, lst4.LustreDescription as Luster4Description,
        tm.LustreNote,
        tm.LustreTemp,
        tm.LustreTempNote
      FROM tblcollect_master tm
      LEFT JOIN tblcollect_design td ON tm.DesignCode = td.DesignCode
      LEFT JOIN tblcollect_category tc ON tm.CategoryCode = tc.CategoryCode
      LEFT JOIN tblcollect_size ts ON tm.SizeCode = ts.SizeCode
      LEFT JOIN tblcollect_texture ttx ON tm.TextureCode = ttx.TextureCode
      LEFT JOIN tblcollect_material tmt ON tm.MaterialCode = tmt.MaterialCode
      LEFT JOIN tblcollect_color tcl ON tm.ColorCode = tcl.ColorCode
      LEFT JOIN tblclay tbcl ON tm.Clay = tbcl.ID
      -- Glaze joins
      LEFT JOIN tblglaze glz1 ON tm.Glaze1 = glz1.ID
      LEFT JOIN tblglaze glz2 ON tm.Glaze2 = glz2.ID
      LEFT JOIN tblglaze glz3 ON tm.Glaze3 = glz3.ID
      LEFT JOIN tblglaze glz4 ON tm.Glaze4 = glz4.ID
      -- Texture joins
      LEFT JOIN tbltexture txt1 ON tm.Texture1 = txt1.ID
      LEFT JOIN tbltexture txt2 ON tm.Texture2 = txt2.ID
      LEFT JOIN tbltexture txt3 ON tm.Texture3 = txt3.ID
      LEFT JOIN tbltexture txt4 ON tm.Texture4 = txt4.ID
      -- Engobe joins
      LEFT JOIN tblengobe eng1 ON tm.Engobe1 = eng1.ID
      LEFT JOIN tblengobe eng2 ON tm.Engobe2 = eng2.ID
      LEFT JOIN tblengobe eng3 ON tm.Engobe3 = eng3.ID
      LEFT JOIN tblengobe eng4 ON tm.Engobe4 = eng4.ID
      -- Estruder joins
      LEFT JOIN tblestruder est1 ON tm.Estruder1 = est1.ID
      LEFT JOIN tblestruder est2 ON tm.Estruder2 = est2.ID
      LEFT JOIN tblestruder est3 ON tm.Estruder3 = est3.ID
      LEFT JOIN tblestruder est4 ON tm.Estruder4 = est4.ID
      -- Tools joins
      LEFT JOIN tbltools tls1 ON tm.Tools1 = tls1.ID
      LEFT JOIN tbltools tls2 ON tm.Tools2 = tls2.ID
      LEFT JOIN tbltools tls3 ON tm.Tools3 = tls3.ID
      LEFT JOIN tbltools tls4 ON tm.Tools4 = tls4.ID
      -- Luster joins
      LEFT JOIN tbllustre lst ON tm.Lustre1 = lst.ID
      LEFT JOIN tbllustre lst2 ON tm.Lustre2 = lst2.ID
      LEFT JOIN tbllustre lst3 ON tm.Lustre3 = lst3.ID
      LEFT JOIN tbllustre lst4 ON tm.Lustre4 = lst4.ID
      LEFT JOIN tblunit tbu ON tm.unit = tbu.UnitID
      WHERE tm.ID = ?
    `;

    const productResult = await query(productSql, [id]) as any[];

    if (productResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult[0];

    // Get related items (same design, category, size)
    const relatedSql = `
      SELECT
        tm.ID, tm.ClientCode, tm.Photo1, tm.Photo2, tm.Photo3, tm.Photo4,
        td.DesignName, tc.CategoryName, ts.SizeName
      FROM tblcollect_master tm
      LEFT JOIN tblcollect_design td ON tm.DesignCode = td.DesignCode
      LEFT JOIN tblcollect_category tc ON tm.CategoryCode = tc.CategoryCode
      LEFT JOIN tblcollect_size ts ON tm.SizeCode = ts.SizeCode
      WHERE tm.DesignCode = ? AND tm.CategoryCode = ? AND tm.SizeCode = ? AND tm.ID != ?
      ORDER BY tm.ID DESC
      LIMIT 10
    `;

    const relatedResult = await query(relatedSql, [product.DesignCode, product.CategoryCode, product.SizeCode, id]) as any[];

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedItems: relatedResult
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}