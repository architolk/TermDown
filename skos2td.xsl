<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:skos="http://www.w3.org/2004/02/skos/core#"
>

<xsl:output method="text"/>

<xsl:variable name="skos-Concept">http://www.w3.org/2004/02/skos/core#Concept</xsl:variable>

<xsl:key name="item" match="/ROOT/rdf:RDF/rdf:Description" use="@rdf:about|@rdf:nodeID"/>

<xsl:template match="rdf:Description[rdf:type/@rdf:resource=$skos-Concept]">
  <xsl:variable name="localname" select="replace(@rdf:about,'^.*[#|/]([^#/]+)$','$1')"/>
  <!-- Full list in one document-->
  <xsl:text># </xsl:text><xsl:value-of select="skos:prefLabel"/><xsl:text>&#xa;&#xa;</xsl:text>
  <xsl:value-of select="skos:definition"/>
  <xsl:text>&#xa;&#xa;</xsl:text>
  <!-- Document per concept -->
  <xsl:result-document href="{$localname}.md">
    <xsl:text>---&#xa;</xsl:text>
    <xsl:text>id: </xsl:text><xsl:value-of select="$localname"/><xsl:text>&#xa;</xsl:text>
    <xsl:text>---&#xa;</xsl:text>
    <xsl:text>#Definition&#xa;&#xa;</xsl:text>
    <xsl:value-of select="skos:definition"/>
  </xsl:result-document>
  </xsl:template>

<xsl:template match="rdf:Description">
  <!-- Failsafe -->
  <xsl:text>TODO</xsl:text>
</xsl:template>

<xsl:template match="/">
  <xsl:for-each select="ROOT/rdf:RDF/rdf:Description"><xsl:sort select="@rdf:about"/>
    <xsl:apply-templates select="."/>
  </xsl:for-each>
</xsl:template>
  
</xsl:stylesheet>
